'use client';

import { useState, useRef } from 'react';

interface SimpleTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export default function SimpleTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className = '',
}: SimpleTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (format: string) => {
    if (!textareaRef.current || readOnly) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'list':
        const lines = selectedText.split('\n');
        formattedText = lines.map(line => `• ${line}`).join('\n');
        newCursorPos = end + lines.length * 2;
        break;
      case 'numbered':
        const numberedLines = selectedText.split('\n');
        formattedText = numberedLines.map((line, index) => `${index + 1}. ${line}`).join('\n');
        newCursorPos = end + numberedLines.reduce((acc, _, index) => acc + `${index + 1}. `.length, 0);
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className={`simple-text-editor ${className}`}>
      {!readOnly && (
        <div className="toolbar border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 p-2 flex gap-2">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 italic"
            title="Italic"
          >
            I
          </button>
          <div className="border-l border-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => applyFormat('list')}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => applyFormat('numbered')}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            title="Numbered List"
          >
            1. List
          </button>
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full min-h-[300px] p-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
          readOnly ? 'bg-gray-50 rounded-lg' : 'rounded-b-lg'
        } ${!readOnly ? 'rounded-t-none' : 'rounded-t-lg'}`}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
        }}
      />
      
      <div className="text-xs text-gray-500 mt-2">
        <p>
          <strong>Formatting tips:</strong> Select text and use toolbar buttons. 
          **bold**, *italic*, • bullet lists, 1. numbered lists
        </p>
      </div>
    </div>
  );
}