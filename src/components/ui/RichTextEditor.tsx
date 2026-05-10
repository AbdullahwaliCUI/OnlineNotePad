'use client';

import dynamic from 'next/dynamic';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';

// Create a wrapper component for ReactQuill
const QuillWrapper = dynamic(
  () => import('react-quill').then((mod) => {
    const ReactQuill = mod.default;
    return React.forwardRef<any, any>((props, ref) => (
      <ReactQuill {...props} ref={ref} />
    ));
  }),
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

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
  selectedText: string;
}

function LinkDialog({ isOpen, onClose, onInsert, selectedText }: LinkDialogProps) {
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState(selectedText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && linkText.trim()) {
      onInsert(url.trim(), linkText.trim());
      setUrl('');
      setLinkText('');
      onClose();
    }
  };

  const handleClose = () => {
    setUrl('');
    setLinkText(selectedText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insert Link</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="linkText" className="block text-sm font-medium text-gray-700 mb-1">
              Link Text
            </label>
            <input
              type="text"
              id="linkText"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Enter link text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              id="linkUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Insert Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className = '',
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const quillRef = useRef<any>(null);

  // Force WYSIWYG styling after component mounts
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor) {
        // Force list styling
        const style = document.createElement('style');
        style.textContent = `
          .ql-editor ol, .ql-editor ul {
            padding-left: 1.5rem !important;
            margin: 1rem 0 !important;
          }
          .ql-editor li {
            display: list-item !important;
            margin-bottom: 0.5rem !important;
          }
          .ql-editor ol li {
            list-style-type: decimal !important;
          }
          .ql-editor ul li {
            list-style-type: disc !important;
          }
          .ql-editor .ql-list-ordered li {
            list-style-type: decimal !important;
            display: list-item !important;
          }
          .ql-editor .ql-list-bullet li {
            list-style-type: disc !important;
            display: list-item !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const modules = useMemo(() => ({
    toolbar: readOnly ? false : {
      container: [
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ],
      handlers: {
        link: () => {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            if (range) {
              const text = quill.getText(range.index, range.length);
              setSelectedText(text || '');
              setShowLinkDialog(true);
            }
          }
        },
        list: function(value: string) {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            if (range) {
              // Apply list formatting
              quill.format('list', value);
              
              // Force immediate visual update
              setTimeout(() => {
                const listItems = quill.container.querySelectorAll('li');
                listItems.forEach((li: HTMLElement) => {
                  if (value === 'ordered') {
                    li.style.listStyleType = 'decimal';
                    li.style.display = 'list-item';
                  } else if (value === 'bullet') {
                    li.style.listStyleType = 'disc';
                    li.style.display = 'list-item';
                  }
                });
              }, 10);
            }
          }
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [readOnly]);

  const formats = [
    'size',
    'bold', 'italic',
    'list', 'bullet',
    'link'
  ];

  const handleLinkInsert = (url: string, text: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        // Delete selected text if any
        if (range.length > 0) {
          quill.deleteText(range.index, range.length);
        }
        // Insert the link
        quill.insertText(range.index, text);
        quill.formatText(range.index, text.length, 'link', url);
        // Move cursor to end of inserted text
        quill.setSelection(range.index + text.length);
      }
    }
  };

  const handleChange = (content: string) => {
    onChange(content);
    
    // Force list styling after content change
    setTimeout(() => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        const container = editor.container;
        
        // Force list styling
        const listItems = container.querySelectorAll('li');
        listItems.forEach((li: HTMLElement) => {
          const parent = li.parentElement;
          if (parent?.tagName === 'OL') {
            li.style.listStyleType = 'decimal';
            li.style.display = 'list-item';
          } else if (parent?.tagName === 'UL') {
            li.style.listStyleType = 'disc';
            li.style.display = 'list-item';
          }
        });
        
        const lists = container.querySelectorAll('ol, ul');
        lists.forEach((list: HTMLElement) => {
          list.style.paddingLeft = '1.5rem';
          list.style.margin = '1rem 0';
        });
      }
    }, 10);
  };

  return (
    <>
      <div className={`rich-text-editor wysiwyg-editor ${className}`}>
        <QuillWrapper
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          modules={modules}
          formats={formats}
          style={{
            backgroundColor: readOnly ? '#f9fafb' : '#ffffff',
          }}
        />
        
        <style jsx global>{`
          /* STRICT WYSIWYG STYLING - FORCE LIST DISPLAY */
          .wysiwyg-editor .ql-editor {
            min-height: 300px;
            font-size: 16px;
            line-height: 1.6;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .wysiwyg-editor .ql-toolbar {
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-bottom: none;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background: #fafafa;
          }
          
          .wysiwyg-editor .ql-container {
            border-bottom: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-top: none;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
          }
          
          .wysiwyg-editor .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }

          /* FORCE LIST STYLING - HIGHEST PRIORITY */
          .wysiwyg-editor .ql-editor ol,
          .wysiwyg-editor .ql-editor ul {
            padding-left: 1.5rem !important;
            margin: 1rem 0 !important;
            list-style-position: inside !important;
          }

          .wysiwyg-editor .ql-editor li {
            display: list-item !important;
            margin-bottom: 0.5rem !important;
            padding-left: 0.25rem !important;
          }

          .wysiwyg-editor .ql-editor ol li {
            list-style-type: decimal !important;
          }

          .wysiwyg-editor .ql-editor ul li {
            list-style-type: disc !important;
          }

          /* Override Quill's default list styling */
          .wysiwyg-editor .ql-editor .ql-list-ordered li {
            list-style-type: decimal !important;
            display: list-item !important;
          }

          .wysiwyg-editor .ql-editor .ql-list-bullet li {
            list-style-type: disc !important;
            display: list-item !important;
          }

          /* Link styling */
          .wysiwyg-editor .ql-editor a {
            color: #3b82f6;
            text-decoration: underline;
          }
          
          .wysiwyg-editor .ql-editor a:hover {
            color: #1d4ed8;
          }

          /* Size picker labels */
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-label::before,
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-item::before {
            content: 'Normal';
          }
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=small]::before,
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=small]::before {
            content: 'Small';
          }
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=large]::before,
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=large]::before {
            content: 'Large';
          }
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=huge]::before,
          .wysiwyg-editor .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=huge]::before {
            content: 'Huge';
          }
        `}</style>
      </div>

      <LinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onInsert={handleLinkInsert}
        selectedText={selectedText}
      />
    </>
  );
}