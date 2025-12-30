'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';
import { sanitizeHtml } from '@/lib/utils';

export default function NewNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be signed in to create notes');
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
        toast.error('Failed to create note');
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
      if (confirm('Are you sure you want to discard this note?')) {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
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
              {isSaving ? 'Saving...' : 'Save Note'}
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
              You can make text <strong>bold</strong>, <em>italic</em>, create lists, and more.
            </p>
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