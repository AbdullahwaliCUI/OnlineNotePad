'use client';

import { useRef, useEffect, useState } from 'react';
import VoiceInput from '@/components/ui/VoiceInput';
import { useTheme } from '@/contexts/ThemeContext';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className = '',
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Format commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Create ordered list
  const createOrderedList = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // Split selected text into lines and create list
        const lines = selectedText.split('\n').filter(line => line.trim());
        let listHTML = '<ol>';
        lines.forEach(line => {
          listHTML += `<li>${line.trim()}</li>`;
        });
        listHTML += '</ol>';
        
        // Replace selected text with list
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = listHTML;
        range.insertNode(div.firstChild!);
      } else {
        // Create new list at cursor
        execCommand('insertOrderedList');
      }
    } else {
      execCommand('insertOrderedList');
    }
    handleInput();
  };

  // Create unordered list
  const createUnorderedList = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // Split selected text into lines and create list
        const lines = selectedText.split('\n').filter(line => line.trim());
        let listHTML = '<ul>';
        lines.forEach(line => {
          listHTML += `<li>${line.trim()}</li>`;
        });
        listHTML += '</ul>';
        
        // Replace selected text with list
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = listHTML;
        range.insertNode(div.firstChild!);
      } else {
        // Create new list at cursor
        execCommand('insertUnorderedList');
      }
    } else {
      execCommand('insertUnorderedList');
    }
    handleInput();
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Insert text at cursor position (for voice input)
  const insertTextAtCursor = (text: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection, append to end
        editorRef.current.innerHTML += text;
      }
      handleInput();
    }
  };

  return (
    <div className={`wysiwyg-editor-container flex flex-col h-full ${className}`}>
      {/* Voice Input */}
      {!readOnly && (
        <div className={`mx-8 mb-4 p-4 ${themeClasses.cardBackground} border ${themeClasses.cardBorder} rounded-lg shadow-sm`}>
          <h4 className={`text-sm font-medium ${themeClasses.primaryText} mb-2 flex items-center gap-2`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            Voice Input (Urdu → English)
          </h4>
          <VoiceInput
            onTextInsert={insertTextAtCursor}
            className="w-full"
          />
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && (
        <div className={`toolbar sticky top-0 z-40 ${themeClasses.cardBackground} backdrop-blur-md border-b ${themeClasses.cardBorder} p-2 sm:p-3 flex flex-wrap items-center gap-1.5 shadow-sm rounded-t-lg mx-auto w-full transition-all`}>
          {/* Font Size */}
          <select
            onChange={(e) => execCommand('fontSize', e.target.value)}
            className={`px-2 py-1.5 border ${themeClasses.cardBorder} rounded text-sm bg-transparent ${themeClasses.primaryText} focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors`}
          >
            <option value="3">Normal text</option>
            <option value="2">Small text</option>
            <option value="4">Heading 3</option>
            <option value="5">Heading 2</option>
            <option value="6">Heading 1</option>
          </select>

          {/* Bold */}
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className={`p-1.5 ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors`}
            title="Bold"
          >
            B
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className={`p-1.5 ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors`}
            title="Italic"
          >
            I
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className={`p-1.5 ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors`}
            title="Underline"
          >
            U
          </button>

          <div className={`w-px h-5 ${themeClasses.cardBorder} border-l mx-1`}></div>

          {/* Ordered List */}
          <button
            type="button"
            onClick={createOrderedList}
            className={`px-3 py-1.5 text-sm ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors font-medium flex items-center gap-1`}
            title="Numbered List"
          >
            1. List
          </button>

          {/* Unordered List */}
          <button
            type="button"
            onClick={createUnorderedList}
            className={`px-3 py-1.5 text-sm ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors font-medium flex items-center gap-1`}
            title="Bullet List"
          >
            • List
          </button>

          <div className={`w-px h-5 ${themeClasses.cardBorder} border-l mx-1`}></div>

          {/* Link */}
          <button
            type="button"
            onClick={insertLink}
            className={`px-3 py-1.5 text-sm ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors font-medium flex items-center gap-1`}
            title="Insert Link"
          >
            🔗
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={() => {
              // Focus editor for voice input
              editorRef.current?.focus();
            }}
            className={`px-3 py-1.5 text-sm ${themeClasses.buttonPrimary} rounded transition-colors font-medium flex items-center gap-1`}
            title="Voice Input Available Above"
          >
            🎤 Voice
          </button>

          {/* Undo */}
          <button
            type="button"
            onClick={() => execCommand('undo')}
            className={`px-3 py-1.5 text-sm ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors font-medium flex items-center gap-1`}
            title="Undo"
          >
            ↶
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => execCommand('redo')}
            className={`px-3 py-1.5 text-sm ${themeClasses.iconColor} hover:opacity-80 rounded transition-colors font-medium flex items-center gap-1`}
            title="Redo"
          >
            ↷
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        className={`editor-content flex-1 px-8 py-6 sm:px-12 sm:py-10 min-h-[800px] focus:outline-none bg-transparent ${themeClasses.primaryText}`}
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        .editor-content ol,
        .editor-content ul {
          padding-left: 2rem !important;
          margin: 1rem 0 !important;
        }

        .editor-content li {
          display: list-item !important;
          margin-bottom: 0.5rem !important;
        }

        .editor-content ol li {
          list-style-type: decimal !important;
        }

        .editor-content ul li {
          list-style-type: disc !important;
        }

        .editor-content p {
          margin: 0.5rem 0;
        }

        .editor-content strong {
          font-weight: bold;
        }

        .editor-content em {
          font-style: italic;
        }

        .editor-content u {
          text-decoration: underline;
        }

        .editor-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .editor-content a:hover {
          color: #1d4ed8;
        }

        .editor-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }

        .editor-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }

        .editor-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}