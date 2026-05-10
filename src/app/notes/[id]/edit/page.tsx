'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
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
import type { Note } from '@/types/database';

export default function EditNotePage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(true);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    if (noteId && user) {
      loadNote();
    }
  }, [noteId, user]);

  const loadNote = async () => {
    if (!noteId || !user) return;

    setLoading(true);
    try {
      const noteData = await noteService.getNote(noteId, user.id);

      if (noteData) {
        const note = noteData as unknown as Note;
        setNote(note);
        setTitle(note.title || '');
        // Use the original content, not the HTML version
        setContent(note.content || '');
      } else {
        toast.error('Note not found or you do not have permission to edit it');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      toast.error('Failed to load note');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

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
    if (!user || !note) {
      toast.error('You must be signed in to edit notes');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Properly save rich text content
      const updateData = {
        title: title.trim(),
        content: content, // Keep original rich HTML content
        content_html: content, // Save the rich HTML content for display
      };

      const updatedNote = await noteService.updateNote(note.id, updateData);

      if (updatedNote) {
        toast.success('Note updated successfully!');
        router.push(`/notes/${note.id}`);
      } else {
        toast.error('Failed to update note. Please try again.');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('An error occurred while updating the note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (note && (title !== (note.title || '') || content !== (note.content || ''))) {
      if (confirm('Are you sure you want to discard your changes?')) {
        router.push(`/notes/${noteId}`);
      }
    } else {
      router.push(`/notes/${noteId}`);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading note...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!note) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Note not found</h1>
              <Link href="/dashboard" className="btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-[#F8F9FA] dark:bg-gray-900 flex flex-col`}>
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <Link href={`/notes/${noteId}`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">Back to Note</span>
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-500 font-medium">Editing Document</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${isSaving || !title.trim()
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                }`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-8">
          <div className="max-w-[850px] mx-auto bg-white dark:bg-gray-800 shadow-lg min-h-[1056px] border border-gray-200 dark:border-gray-700 relative">
            
            {/* Seamless Title */}
            <div className="px-8 pt-12 sm:px-12 sm:pt-16 pb-2">
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Document"
                maxLength={200}
                className="w-full text-4xl sm:text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-white"
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