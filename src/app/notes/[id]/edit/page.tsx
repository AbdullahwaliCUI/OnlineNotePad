'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import GoogleDocsEditor from '@/components/ui/GoogleDocsEditor';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { noteService } from '@/lib/database';
import { sanitizeHtml } from '@/lib/utils';
import { noteSchema, validateNoteContent } from '@/lib/validations';
import { z } from 'zod';
import type { Note } from '@/types/database';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import { getOrCreateAppFolder, saveNoteToDrive } from '@/lib/googleDrive';

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
  const { isConnected, accessToken } = useGoogleDrive();

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

        // Sync to Google Drive if connected
        if (isConnected && accessToken) {
          try {
            toast.loading('Syncing to Google Drive...', { id: 'drive-sync' });
            const folderId = await getOrCreateAppFolder(accessToken);
            if (folderId) {
              await saveNoteToDrive(accessToken, title.trim(), content, folderId);
              toast.success('Synced to Google Drive!', { id: 'drive-sync' });
            } else {
              toast.error('Failed to create Drive folder.', { id: 'drive-sync' });
            }
          } catch (e) {
            console.error('Drive sync failed:', e);
            toast.error('Drive sync failed.', { id: 'drive-sync' });
          }
        }

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

  const handleTitleChange = (newTitle: string) => {
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
      <GoogleDocsEditor
        title={title}
        onTitleChange={handleTitleChange}
        content={content}
        onContentChange={handleContentChange}
        onSave={handleSave}
        isSaving={isSaving}
        onCancel={handleCancel}
        noteId={noteId}
      />
    </ProtectedRoute>
  );
}