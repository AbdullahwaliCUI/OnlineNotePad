'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SimpleTextEditor from '@/components/ui/SimpleTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';
import type { Note } from '@/types/database';
import { sanitizeHtml, htmlToSimpleText } from '@/lib/utils';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useSimpleEditor, setUseSimpleEditor] = useState(true);
  const [isShared, setIsShared] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isTogglingShare, setIsTogglingShare] = useState(false);

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
        setNote(noteData as any); // Type assertion for compatibility
        setTitle(noteData.title);
        
        // Convert HTML content back to simple format for editing
        let editableContent = noteData.content_html || noteData.content;
        
        // If using simple editor, convert HTML back to markdown-like format
        if (useSimpleEditor && noteData.content_html) {
          editableContent = htmlToSimpleText(noteData.content_html);
        } else if (!useSimpleEditor) {
          // For rich editor, use HTML content
          editableContent = noteData.content_html || noteData.content;
        } else {
          // For simple editor with no HTML, use plain content
          editableContent = noteData.content;
        }
        
        setContent(editableContent);
        setIsShared((noteData as any).is_shared || false);
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

      const updates = {
        title: title.trim(),
        content: plainTextContent,
        content_html: sanitizedContent,
        is_shared: isShared,
      };

      const updatedNote = await noteService.updateNote(note.id, updates);

      if (updatedNote) {
        toast.success('Note updated successfully!');
        setNote({ ...note, ...updatedNote } as any);
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

  const handleDelete = async () => {
    if (!note) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!note) return;

    setIsDeleting(true);
    
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
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditorSwitch = () => {
    const newEditorType = !useSimpleEditor;
    setUseSimpleEditor(newEditorType);
    
    // Convert content format when switching editors
    if (note) {
      let convertedContent = content;
      
      if (newEditorType) {
        // Switching to simple editor - convert HTML to markdown-like format
        if (note.content_html) {
          convertedContent = htmlToSimpleText(note.content_html);
        }
      } else {
        // Switching to rich editor - use HTML content
        convertedContent = note.content_html || note.content;
      }
      
      setContent(convertedContent);
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
        setNote({ ...note, ...updatedNote } as any);
        setIsShared(newSharedState);
        toast.success(newSharedState ? 'Note is now public!' : 'Note is now private');
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
    if (!(note as any)?.share_id) return '';
    return `${window.location.origin}/s/${(note as any).share_id}`;
  };

  const handleWhatsAppShare = () => {
    if (!note) return;
    
    const publicUrl = getPublicUrl();
    const text = `${title} - ${publicUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (!note) return;

    const publicUrl = getPublicUrl();
    const shareData = {
      title: title,
      text: `Check out this note: ${title}`,
      url: publicUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${title} - ${publicUrl}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to WhatsApp
      handleWhatsAppShare();
    }
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
        {/* Header with Save and Share buttons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Note</h1>
            <p className="text-gray-600 mt-1">Make changes to your note</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="btn-secondary"
            >
              Back to Dashboard
            </Link>
            
            {/* Share Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Share:</label>
                <button
                  onClick={handleShareToggle}
                  disabled={isTogglingShare}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isShared ? 'bg-blue-600' : 'bg-gray-200'
                  } ${isTogglingShare ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isShared ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Share Buttons */}
              {isShared && (
                <>
                  <button
                    onClick={handleNativeShare}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    📱 Share
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    📱 WhatsApp
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                isDeleting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'text-red-600 hover:text-red-700 border-red-300 hover:border-red-400'
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
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
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Maximized Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <button
                type="button"
                onClick={handleEditorSwitch}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {useSimpleEditor ? 'Use Rich Editor' : 'Use Simple Editor'}
              </button>
            </div>
            
            {useSimpleEditor ? (
              <SimpleTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your note..."
              />
            ) : (
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your note..."
              />
            )}
          </div>
        </div>

        {/* Bottom Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Public URL */}
          {isShared && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Public URL</h4>
              <div className="flex">
                <input
                  type="text"
                  value={getPublicUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-lg bg-gray-50"
                />
                <button
                  onClick={copyPublicUrl}
                  className="px-3 py-2 text-sm bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Note Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Note Statistics</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {note.word_count > 0 && <div>Words: {note.word_count}</div>}
              {note.reading_time > 0 && <div>Reading time: {note.reading_time} min</div>}
              <div>Characters: {content.length}</div>
            </div>
          </div>

          {/* Note Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Note Info</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Created: {new Date(note.created_at).toLocaleDateString()}</div>
              <div>Updated: {new Date(note.updated_at).toLocaleDateString()}</div>
              <div>Status: {isShared ? 'Public' : 'Private'}</div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Delete Note"
          message="Are you sure you want to delete this note? This action cannot be undone and all content will be permanently lost."
          confirmText="Delete Note"
          cancelText="Cancel"
          type="danger"
          loading={isDeleting}
        />
      </div>
    </ProtectedRoute>
  );
}