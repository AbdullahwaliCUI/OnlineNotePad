'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import PhoneInput from '@/components/ui/PhoneInput';
import toast from 'react-hot-toast';

export default function ComponentShowcase() {
  const [richText, setRichText] = useState('<p>Try editing this rich text!</p>');
  const [phone, setPhone] = useState<string | undefined>('');

  const showToast = () => {
    toast.success('This is a success toast!');
  };

  const showErrorToast = () => {
    toast.error('This is an error toast!');
  };

  return (
    <div className="container-custom py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Component Showcase</h2>
      
      <div className="space-y-8">
        {/* Rich Text Editor */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rich Text Editor</h3>
          <RichTextEditor
            value={richText}
            onChange={setRichText}
            placeholder="Start writing your note..."
          />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">HTML Output:</h4>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{richText}</pre>
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phone Number Input</h3>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            placeholder="Enter your phone number"
            className="max-w-md"
          />
          {phone && (
            <p className="mt-2 text-sm text-gray-600">
              Formatted: {phone}
            </p>
          )}
        </div>

        {/* Toast Examples */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Toast Notifications</h3>
          <div className="flex gap-4">
            <button onClick={showToast} className="btn-primary">
              Show Success Toast
            </button>
            <button onClick={showErrorToast} className="btn-secondary">
              Show Error Toast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}