'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { sanitizeHtml } from '@/lib/utils';

export default function TestEditorPage() {
  const [content, setContent] = useState('<p>Test your <strong>rich text editor</strong> here!</p><p>Try adding a <a href="https://example.com">link</a> using the link button.</p>');
  const [sanitizedOutput, setSanitizedOutput] = useState('');

  const handleSanitize = () => {
    const sanitized = sanitizeHtml(content);
    setSanitizedOutput(sanitized);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Rich Text Editor Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Editor</h2>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Test the rich text editor..."
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Raw HTML Output</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            {content}
          </pre>
        </div>

        <div>
          <button
            onClick={handleSanitize}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sanitize Content
          </button>
        </div>

        {sanitizedOutput && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Sanitized Output</h2>
            <pre className="bg-green-100 p-4 rounded-lg text-sm overflow-x-auto">
              {sanitizedOutput}
            </pre>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Rendered Preview</h2>
          <div 
            className="border border-gray-300 rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: sanitizedOutput || content }}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Try formatting text with bold, italic, and different sizes</li>
            <li>• Create ordered and unordered lists</li>
            <li>• Select text and click the link button to add hyperlinks</li>
            <li>• Try pasting content from other websites</li>
            <li>• Verify that image/video upload buttons are hidden</li>
            <li>• Check that external links open in new tabs with security attributes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}