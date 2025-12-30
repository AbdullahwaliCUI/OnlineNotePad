'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

// Create a wrapper component for ReactQuill
const QuillWrapper = dynamic(
  () => import('react-quill'),
  { 
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50 animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    )
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className = '',
}: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: readOnly ? false : [
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }), [readOnly]);

  const formats = [
    'size',
    'bold', 'italic',
    'list', 'bullet'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <QuillWrapper
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{
          backgroundColor: readOnly ? '#f9fafb' : '#ffffff',
        }}
      />
      
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: 300px;
          font-size: 16px;
          line-height: 1.6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: none;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #fafafa;
        }
        
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-top: none;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-item::before {
          content: 'Normal';
        }
        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=small]::before,
        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=small]::before {
          content: 'Small';
        }
        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=large]::before,
        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=large]::before {
          content: 'Large';
        }
        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=huge]::before,
        .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=huge]::before {
          content: 'Huge';
        }
      `}</style>
    </div>
  );
}