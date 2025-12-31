'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';
import type { Note } from '@/types/database';
import { formatDateTime } from '@/lib/utils';

export default function NotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && noteId) {
      loadNote();
    }
  }, [user, noteId]);

  const loadNote = async () => {
    if (!user || !noteId) return;

    setLoading(true);
    setError(null);

    try {
      const noteData = await noteService.getNote(noteId, user.id);

      if (noteData) {
        setNote(noteData as unknown as Note);
        // Update last viewed timestamp
        await noteService.updateLastViewed(noteId);
      } else {
        setError('Note not found or you do not have permission to view it');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        const success = await noteService.deleteNote(note.id);

        if (success) {
          toast.success('Note deleted successfully');
          router.push('/dashboard');
        } else {
          toast.error('Failed to delete note');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('An error occurred while deleting the note');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container-custom py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading note...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !note) {
    return (
      <ProtectedRoute>
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Note not found'}
            </h1>
            <Link href="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {note.title || 'Untitled Note'}
            </h1>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span>Created {formatDateTime(note.created_at)}</span>
              <span>Updated {formatDateTime(note.updated_at)}</span>
              {note.word_count > 0 && <span>{note.word_count} words</span>}
              {note.reading_time > 0 && <span>{note.reading_time} min read</span>}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Link
              href={`/notes/${note.id}/edit`}
              className="btn-primary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Note
            </Link>
          </div>
          <span className="text-xs text-gray-500 hidden sm:block">
            Tip: Double-click note to edit
          </span>
        </div>

        {/* Note Content */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-text hover:shadow-md transition-shadow duration-200"
          onDoubleClick={() => router.push(`/notes/${note.id}/edit`)}
          title="Double-click to edit"
        >
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content_html || note.content }}
          />

          {(!note.content_html && !note.content) && (
            <p className="text-gray-500 italic">This note is empty. Double-click to start writing.</p>
          )}
        </div>

        {/* Note Metadata */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {note.is_pinned && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                📌 Pinned
              </span>
            )}
            {note.is_public && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🌐 Public
              </span>
            )}
            {note.is_archived && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                📦 Archived
              </span>
            )}
          </div>

          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}