'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Share2, Copy, ExternalLink, Globe, Trash2, Edit } from 'lucide-react';
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
  const [isShared, setIsShared] = useState(false);
  const [isTogglingShare, setIsTogglingShare] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (user && noteId) {
      loadNote();
    }
  }, [user, noteId]);

  // Add keyboard shortcut for editing (Ctrl+E or Cmd+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && note) {
        e.preventDefault();
        router.push(`/notes/${note.id}/edit`);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [note, router]);

  const loadNote = async () => {
    if (!user || !noteId) return;

    setLoading(true);
    setError(null);

    try {
      const noteData = await noteService.getNote(noteId, user.id);

      if (noteData) {
        setNote(noteData as unknown as Note);
        setIsShared(noteData.is_shared);
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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Double-click detected, navigating to edit page');
    router.push(`/notes/${note?.id}/edit`);
  };

  const handleSingleClick = (e: React.MouseEvent) => {
    // Only handle single click if it's not part of a double-click
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.closest('a')) {
      return; // Don't interfere with links
    }
  };

  const handleShareToggle = async () => {
    if (!note) return;

    const newSharedState = !isShared;
    setIsTogglingShare(true);

    try {
      const updates = { is_shared: newSharedState };
      const updatedNote = await noteService.updateNote(note.id, updates);

      if (updatedNote) {
        setNote({ ...note, ...updatedNote } as Note);
        setIsShared(newSharedState);
        toast.success(newSharedState ? 'Note is now public!' : 'Note is now private');
        if (newSharedState) {
          setShowShareOptions(true);
        } else {
          setShowShareOptions(false);
        }
      } else {
        toast.error('Failed to update sharing settings');
      }
    } catch (error) {
      console.error('Error updating share settings:', error);
      toast.error('An error occurred while updating sharing settings');
    } finally {
      setIsTogglingShare(false);
    }
  };

  const getPublicUrl = () => {
    if (!note?.share_id) return '';
    return `${window.location.origin}/s/${note.share_id}`;
  };

  const copyPublicUrl = async () => {
    if (!note) return;

    try {
      const publicUrl = getPublicUrl();
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Public URL copied to clipboard!');
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const handleWhatsAppShare = () => {
    if (!note) return;
    const publicUrl = getPublicUrl();
    const text = `${note.title} - ${publicUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href={`/notes/${note.id}/edit`}
              className="btn-primary flex items-center px-4 py-2"
            >
              <Edit size={16} className="mr-2" />
              Edit Note
            </Link>

            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${isShared || showShareOptions
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {isShared ? <Globe size={16} className="mr-2" /> : <Share2 size={16} className="mr-2" />}
              {isShared ? 'Shared' : 'Share'}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>
          </div>

          <div className="text-right hidden md:block">
            <span className="text-xs text-gray-500 block">
              💡 Tip: Double-click note content to edit
            </span>
            <span className="text-xs text-blue-600 block">
              Or press Ctrl+E (Cmd+E on Mac)
            </span>
          </div>
        </div>

        {/* Share Options Panel */}
        {showShareOptions && (
          <div className="mb-6 bg-white rounded-lg border border-blue-100 shadow-sm p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${isShared ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {isShared ? 'Public Link Active' : 'Public Sharing'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isShared
                      ? 'Anyone with the link can view this note.'
                      : 'Enable public sharing to generate a view-only link.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isShared}
                    onChange={handleShareToggle}
                    disabled={isTogglingShare}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {isShared && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                    <Globe size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      readOnly
                      value={getPublicUrl()}
                      className="bg-transparent border-none focus:ring-0 w-full text-sm text-gray-600 truncate"
                    />
                  </div>
                  <button
                    onClick={copyPublicUrl}
                    className="p-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-300 hover:border-blue-200 rounded-lg transition-colors"
                    title="Copy Link"
                  >
                    <Copy size={18} />
                  </button>
                  <a
                    href={getPublicUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-300 hover:border-blue-200 rounded-lg transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="text-xs flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                  >
                    Share on WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Note Content */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 select-none"
          onDoubleClick={handleDoubleClick}
          onClick={handleSingleClick}
          title="Double-click to edit"
          style={{ userSelect: 'none' }}
        >
          <div
            className="prose prose-lg max-w-none pointer-events-none"
            dangerouslySetInnerHTML={{ __html: note.content_html || note.content }}
          />

          {(!note.content_html && !note.content) && (
            <p className="text-gray-500 italic pointer-events-none">This note is empty. Double-click to start writing.</p>
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