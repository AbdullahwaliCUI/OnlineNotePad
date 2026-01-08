'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import TiptapEditor from '@/components/TiptapEditor';
import WysiwygEditor from '@/components/ui/WysiwygEditor';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { noteService } from '@/lib/database';
import { sanitizeHtml } from '@/lib/utils';
import { noteSchema, validateNoteContent } from '@/lib/validations';
import { z } from 'zod';

export default function NewNotePage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
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
      // Properly save rich text content
      const noteData = {
        user_id: user.id,
        title: title.trim(),
        content: content, // Keep original rich HTML content
        content_html: content, // Save the rich HTML content for display
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
      <div className={`min-h-screen ${themeClasses.background}`}>
        <DashboardLayout>
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Note</h1>
                <p className="text-gray-600">Write your thoughts and ideas</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl ${isSaving || !title.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : themeClasses.buttonPrimary
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
                  className={`w-full px-4 py-3 text-xl border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.title
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
                    {useSimpleEditor ? 'Use Rich Editor' : 'Use WYSIWYG Editor'}
                  </button>
                </div>

                <div className={`${errors.content ? 'ring-2 ring-red-500 rounded-lg' : ''}`}>
                  {useSimpleEditor ? (
                    <WysiwygEditor
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Start writing your note..."
                      className="min-h-[400px]"
                    />
                  ) : (
                    <TiptapEditor
                      content={content}
                      onChange={handleContentChange}
                      placeholder="Start writing your note..."
                    />
                  )}
                </div>

                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">✨ Writing Tips:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                {useSimpleEditor ? (
                  <>
                    <ul className="space-y-1">
                      <li>• <strong>🎤 Voice Input:</strong> Click the voice button to speak in Urdu and get English text</li>
                      <li>• <strong>Rich Formatting:</strong> Bold, italic, colors, alignment, and more</li>
                      <li>• <strong>Text Selection:</strong> Select text with mouse, then use toolbar buttons</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>• <strong>Font Controls:</strong> Change size, colors, and line height</li>
                      <li>• <strong>Lists & Alignment:</strong> Bullet points, numbers, and text alignment</li>
                      <li>• <strong>Switch Editors:</strong> Use "Rich Editor" for advanced formatting</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <ul className="space-y-1">
                      <li>• <strong>Rich Formatting:</strong> Bold, italic, lists, and more</li>
                      <li>• <strong>Keyboard Shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic)</li>
                      <li>• <strong>Text Selection:</strong> Select text, then use toolbar buttons</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>• <strong>Lists & Headings:</strong> Use toolbar for structured content</li>
                      <li>• <strong>Advanced Features:</strong> Quotes, code blocks, and more</li>
                      <li>• <strong>Switch Editors:</strong> Use "Plain Text" for voice input and advanced formatting</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-6">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </div>
    </ProtectedRoute>
  );
}