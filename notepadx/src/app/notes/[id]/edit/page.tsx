'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';
import type { Note } from '@/types/database';
import { sanitizeHtml } from '@/lib/utils';

export default function EditNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        setNote(noteData);
        setTitle(noteData.title);
        setContent(noteData.content_html || noteData.content);
      } else {
        setError('Note not found or you do not have permission to edit it');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !note) {
      toast.error('You must be signed in to edit notes');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    setIsSaving(true);

    try {
      // Sanitize HTML content
      const sanitizedContent = sanitizeHtml(content);
      
      // Create plain text version for excerpt and word count
      const plainTextContent = content.replace(/<[^>]*>/g, '').trim();

      const updates = {
        title: title.trim(),
        content: plainTextContent,
        content_html: sanitizedContent,
      };

      const updatedNote = await noteService.updateNote(note.id, updates);

      if (updatedNote) {
        toast.success('Note updated successfully!');
        router.push(`/notes/${note.id}`);
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('An error occurred while updating the note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!note) return;
    
    const hasChanges = title !== note.title || content !== (note.content_html || note.content);
    
    if (hasChanges) {
      if (confirm('Are you sure you want to discard your changes?')) {
        router.push(`/notes/${note.id}`);
      }
    } else {
      router.push(`/notes/${note.id}`);
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Note</h1>
            <p className="text-gray-600 mt-1">Make changes to your note</p>
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Note Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          {/* Content Editor */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your note..."
            />
          </div>

          {/* Save Instructions */}
          <div className="text-sm text-gray-500">
            <p>
              <strong>Tip:</strong> Use the toolbar above to format your text. 
              Changes are saved when you click "Save Changes".
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link href={`/notes/${note.id}`} className="text-blue-600 hover:text-blue-700">
            ← Back to Note
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}