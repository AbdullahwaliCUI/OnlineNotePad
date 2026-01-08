'use client';

import { useRef, useEffect, useState } from 'react';

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

  return (
    <div className={`wysiwyg-editor-container ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="toolbar border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Font Size */}
          <select
            onChange={(e) => execCommand('fontSize', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="3">Normal</option>
            <option value="2">Small</option>
            <option value="4">Large</option>
            <option value="5">Huge</option>
          </select>

          {/* Bold */}
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 font-bold"
            title="Bold"
          >
            B
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 italic"
            title="Italic"
          >
            I
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 underline"
            title="Underline"
          >
            U
          </button>

          <div className="border-l border-gray-300 mx-1"></div>

          {/* Ordered List */}
          <button
            type="button"
            onClick={createOrderedList}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="Numbered List"
          >
            1. List
          </button>

          {/* Unordered List */}
          <button
            type="button"
            onClick={createUnorderedList}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="Bullet List"
          >
            • List
          </button>

          <div className="border-l border-gray-300 mx-1"></div>

          {/* Link */}
          <button
            type="button"
            onClick={insertLink}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="Insert Link"
          >
            🔗
          </button>

          {/* Undo */}
          <button
            type="button"
            onClick={() => execCommand('undo')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="Undo"
          >
            ↶
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => execCommand('redo')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
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
        className={`editor-content border border-gray-300 ${!readOnly ? 'rounded-b-lg' : 'rounded-lg'} p-4 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-50' : 'bg-white'}`}
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