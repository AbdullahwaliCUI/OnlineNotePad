'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SimpleTextEditor from '@/components/ui/SimpleTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';
import { sanitizeHtml } from '@/lib/utils';
import { noteSchema, validateNoteContent } from '@/lib/validations';
import { z } from 'zod';

export default function NewNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(true);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const validateForm = (): boolean => {
    try {
      // Validate using Zod schema
      noteSchema.parse({
        title: title.trim(),
        content: content,
      });

      // Additional content validation
      const contentValidation = validateNoteContent(content);
      if (!contentValidation.isValid) {
        setErrors({ content: contentValidation.error });
        toast.error(contentValidation.error || 'Content validation failed');
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { title?: string; content?: string } = {};
        error.issues.forEach((err: any) => {
          if (err.path[0] === 'title') {
            fieldErrors.title = err.message;
          } else if (err.path[0] === 'content') {
            fieldErrors.content = err.message;
          }
        });
        setErrors(fieldErrors);
        
        // Show the first error as toast
        const firstError = error.issues[0];
        toast.error(firstError.message);
        return false;
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be signed in to create notes');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      let htmlContent = content;
      let plainTextContent = content;

      // If using simple editor, convert markdown-like syntax to HTML
      if (useSimpleEditor) {
        htmlContent = content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^• (.+)$/gm, '<li>$1</li>')
          .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
          .replace(/\n/g, '<br>');
        
        // Wrap lists in proper tags
        htmlContent = htmlContent
          .replace(/(<li>(?:(?!<li>).)*<\/li>)/g, '<ul>$1</ul>')
          .replace(/(<li>\d+\.(?:(?!<li>).)*<\/li>)/g, '<ol>$1</ol>');
        
        plainTextContent = content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
      } else {
        // For rich editor, extract plain text
        plainTextContent = content.replace(/<[^>]*>/g, '').trim();
      }

      // Sanitize HTML content
      const sanitizedContent = sanitizeHtml(htmlContent);

      const noteData = {
        user_id: user.id,
        title: title.trim(),
        content: plainTextContent,
        content_html: sanitizedContent,
      };

      const newNote = await noteService.createNote(noteData);

      if (newNote) {
        toast.success('Note created successfully!');
        router.push(`/notes/${newNote.id}`);
      } else {
        toast.error('Failed to create note. Please try again.');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('An error occurred while creating the note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm('Are you sure you want to discard this note? All changes will be lost.')) {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Clear title error when user starts typing
    if (errors.title && newTitle.trim()) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Clear content error when user starts typing
    if (errors.content && newContent.trim()) {
      setErrors(prev => ({ ...prev, content: undefined }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Note</h1>
            <p className="text-gray-600 mt-1">Write your thoughts and ideas</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSaving || !title.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Note'
              )}
            </button>
          </div>
        </div>

        {/* Note Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(max 200 characters)</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter note title..."
              maxLength={200}
              className={`w-full px-4 py-3 text-xl border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.title 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={isSaving}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <div className="mt-1 text-xs text-gray-500 text-right">
              {title.length}/200 characters
            </div>
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUseSimpleEditor(!useSimpleEditor)}
                className="text-xs text-blue-600 hover:text-blue-700"
                disabled={isSaving}
              >
                {useSimpleEditor ? 'Use Rich Editor' : 'Use Simple Editor'}
              </button>
            </div>
            
            <div className={`${errors.content ? 'ring-2 ring-red-500 rounded-lg' : ''}`}>
              {useSimpleEditor ? (
                <SimpleTextEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your note..."
                />
              ) : (
                <RichTextEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your note..."
                />
              )}
            </div>
            
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Save Instructions */}
          <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Writing Tips:</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Use the toolbar above to format your text</li>
              <li>• Select text and click the link button to add hyperlinks</li>
              <li>• Your content is automatically saved as you type</li>
              <li>• All content is sanitized for security</li>
            </ul>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}