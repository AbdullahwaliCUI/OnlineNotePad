'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SimpleTextEditor from '@/components/ui/SimpleTextEditor';
import { sanitizeHtml } from '@/lib/utils';

export default function TestEditorPage() {
  const [richContent, setRichContent] = useState('<p>Test your <strong>rich text editor</strong> here!</p><p>Try adding a <a href="https://example.com">link</a> using the link button.</p>');
  const [simpleContent, setSimpleContent] = useState('🎯 **FREE VOICE TRANSLATION TEST** 🎯\n\n✅ **NEW FEATURE:** Voice input with FREE auto-translation!\n\n🎤 **Voice Input Steps:**\n1. Click the 🎤 Voice button in toolbar\n2. Allow microphone permissions\n3. Speak in Urdu: "یہ ایک ٹیسٹ ہے"\n4. Watch it get translated to English for FREE!\n5. Text appears at cursor position\n\n📝 **Text Selection Test:**\n• Select this text and click B for bold\n• Select text and try color buttons\n• Use Ctrl+B, Ctrl+I, Ctrl+U shortcuts\n\n🌍 **FREE Translation Features:**\n• Urdu → English (default)\n• 1000 translations per day FREE\n• No credit card required\n• MyMemory API integration\n• Live transcript display\n• Auto-insert at cursor\n• Settings panel for customization\n\n🚀 **This is like having Google Translate + Microsoft Word combined - FOR FREE!** 🎉');
  const [sanitizedOutput, setSanitizedOutput] = useState('');

  const handleSanitize = () => {
    const sanitized = sanitizeHtml(richContent);
    setSanitizedOutput(sanitized);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Text Editors Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simple Text Editor Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Simple Text Editor</h2>
            <p className="text-gray-600 mb-4">Microsoft Word-like experience with keyboard shortcuts</p>
            <SimpleTextEditor
              value={simpleContent}
              onChange={setSimpleContent}
              placeholder="Test the simple text editor with keyboard shortcuts..."
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Simple Editor Output</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
              {simpleContent}
            </pre>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Advanced WYSIWYG Editor Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🎨 Text Formatting:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Bold:</strong> <kbd className="bg-green-200 px-1 rounded">Ctrl+B</kbd> or B button</li>
                  <li>• <strong>Italic:</strong> <kbd className="bg-green-200 px-1 rounded">Ctrl+I</kbd> or I button</li>
                  <li>• <strong>Underline:</strong> <kbd className="bg-green-200 px-1 rounded">Ctrl+U</kbd> or U button</li>
                  <li>• <strong>Strikethrough:</strong> S button</li>
                  <li>• <strong>Superscript:</strong> X² button</li>
                  <li>• <strong>Subscript:</strong> X₂ button</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📐 Layout & Spacing:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Align Left:</strong> <kbd className="bg-green-200 px-1 rounded">Ctrl+L</kbd> or ⬅️</li>
                  <li>• <strong>Center:</strong> <kbd className="bg-green-200 px-1 rounded">Ctrl+E</kbd> or ↔️</li>
                  <li>• <strong>Align Right:</strong> <kbd className="bg-green-200 px-1 rounded">Ctrl+R</kbd> or ➡️</li>
                  <li>• <strong>Justify:</strong> <kbd className="bg-green-200 px-1 rounded">Ctrl+J</kbd> or ⬌</li>
                  <li>• <strong>Line Spacing:</strong> 1.0, 1.2, 1.5, 1.6, 2.0, 2.5</li>
                  <li>• <strong>Font Size:</strong> 12px to 32px</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎨 Colors & Highlights:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Text Color:</strong> A button with color picker</li>
                  <li>• <strong>Background:</strong> 🎨 button with highlight colors</li>
                  <li>• <strong>Quick Colors:</strong> Preset color palette</li>
                  <li>• <strong>Custom Colors:</strong> Full color picker</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📝 Lists & Actions:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Bullet Lists:</strong> • List button</li>
                  <li>• <strong>Numbered Lists:</strong> 1. List button</li>
                  <li>• <strong>Undo:</strong> ↶ button or <kbd className="bg-green-200 px-1 rounded">Ctrl+Z</kbd></li>
                  <li>• <strong>Redo:</strong> ↷ button or <kbd className="bg-green-200 px-1 rounded">Ctrl+Y</kbd></li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded">
              <p className="font-semibold text-green-900">🎤 FREE Voice Translation Testing:</p>
              <ul className="text-green-800 text-sm mt-1 space-y-1">
                <li>• <strong>Step 1:</strong> Click the 🎤 Voice button in the toolbar</li>
                <li>• <strong>Step 2:</strong> Allow microphone permissions when prompted</li>
                <li>• <strong>Step 3:</strong> Speak in Urdu: "یہ ایک ٹیسٹ ہے"</li>
                <li>• <strong>Step 4:</strong> Watch live transcript appear</li>
                <li>• <strong>Step 5:</strong> Text gets auto-translated to English and inserted!</li>
                <li>• <strong>FREE:</strong> 1000 translations per day, no credit card needed!</li>
                <li>• <strong>Settings:</strong> Click ⚙️ to change languages and toggle translation</li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-green-100 rounded">
              <p className="font-semibold text-green-900">💡 Text Selection Testing:</p>
              <ul className="text-green-800 text-sm mt-1 space-y-1">
                <li>• <strong>Step 1:</strong> Select any text in the editor with your mouse</li>
                <li>• <strong>Step 2:</strong> Click any formatting button (B, I, U, colors, etc.)</li>
                <li>• <strong>Step 3:</strong> The selected text should be formatted and cursor should stay in place</li>
                <li>• <strong>Step 4:</strong> Try keyboard shortcuts: Ctrl+B, Ctrl+I, Ctrl+U</li>
                <li>• <strong>Step 5:</strong> Test color pickers with selected text</li>
                <li>• <strong>Fixed:</strong> Text selection now properly preserved during formatting!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rich Text Editor Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Rich Text Editor</h2>
            <p className="text-gray-600 mb-4">React Quill-based WYSIWYG editor</p>
            <RichTextEditor
              value={richContent}
              onChange={setRichContent}
              placeholder="Test the rich text editor..."
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Rich Editor Raw HTML</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
              {richContent}
            </pre>
          </div>

          <div>
            <button
              onClick={handleSanitize}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sanitize Rich Content
            </button>
          </div>

          {sanitizedOutput && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Sanitized Output</h3>
              <pre className="bg-green-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                {sanitizedOutput}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Rich Editor Test Instructions:</h3>
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

      {/* Rendered Preview Section */}
      {sanitizedOutput && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Rich Editor Rendered Preview</h2>
          <div 
            className="border border-gray-300 rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: sanitizedOutput }}
          />
        </div>
      )}
    </div>
  );
}