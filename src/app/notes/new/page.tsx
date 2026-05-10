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
      <div className={`min-h-screen ${themeClasses.background} flex flex-col`}>
        {/* Top Navigation Bar */}
        <div className={`sticky top-0 z-50 ${themeClasses.cardBackground} border-b ${themeClasses.cardBorder} px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm`}>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium flex items-center gap-2`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className={`h-6 w-px ${themeClasses.cardBorder} border-l`}></div>
            <span className={`text-sm ${themeClasses.primaryText} opacity-70 font-medium`}>New Document</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${themeClasses.primaryText} ${themeClasses.cardBorder} hover:opacity-80`}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${isSaving || !title.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'shadow-md hover:shadow-lg'
                } ${themeClasses.buttonPrimary}`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-8">
          <div className={`max-w-[850px] mx-auto ${themeClasses.cardBackground} shadow-xl min-h-[1056px] border ${themeClasses.cardBorder} relative rounded-sm`}>
            
            {/* Seamless Title */}
            <div className="px-8 pt-12 sm:px-12 sm:pt-16 pb-2">
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Document"
                maxLength={200}
                className={`w-full text-4xl sm:text-5xl font-bold bg-transparent border-none outline-none ${themeClasses.primaryText} placeholder-opacity-40`}
                disabled={isSaving}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Content Editor */}
            <div className="pb-16">
              {useSimpleEditor ? (
                <WysiwygEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start typing..."
                />
              ) : (
                <div className="px-8 sm:px-12">
                  <TiptapEditor
                    content={content}
                    onChange={handleContentChange}
                    placeholder="Start typing..."
                  />
                </div>
              )}
              {errors.content && (
                <p className="mt-2 px-8 sm:px-12 text-sm text-red-600">{errors.content}</p>
              )}
            </div>
            
          </div>
          
          {/* Toggle Editor Link (Bottom) */}
          <div className="max-w-[850px] mx-auto mt-4 text-center">
             <button
                type="button"
                onClick={() => setUseSimpleEditor(!useSimpleEditor)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                disabled={isSaving}
              >
                Switch to {useSimpleEditor ? 'Tiptap Editor' : 'Google Docs Style Editor'}
              </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}