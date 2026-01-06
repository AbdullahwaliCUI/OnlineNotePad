'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDateTime } from '@/lib/utils';
import ShareModal from './ShareModal';
import type { Note } from '@/types/database';

interface NoteCardProps {
  note: Note;
  view?: 'grid' | 'list';
  onDelete?: (note: Note) => void;
  onShare?: (note: Note) => void;
  onTogglePin?: (note: Note) => void;
  onToggleArchive?: (note: Note) => void;
}

export default function NoteCard({ note, view = 'grid', onDelete, onShare, onTogglePin, onToggleArchive }: NoteCardProps) {
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [showShareModal, setShowShareModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on actions
    if ((e.target as HTMLElement).closest('button')) return;
    router.push(`/notes/${note.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/notes/${note.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      onDelete?.(note);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin?.(note);
  };

  // Create a clean preview from content
  const getPreview = (content: string, maxLength: number = 100) => {
    if (!content) return 'No content';
    
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    return plainText.substring(0, maxLength) + '...';
  };

  const ActionButtons = () => (
    <div className="flex items-center gap-1">
      {/* Edit Button */}
      <button
        onClick={handleEdit}
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
        title="Edit note"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* Favorite/Pin Button */}
      <button
        onClick={handleToggleFavorite}
        className={`p-1.5 rounded-md transition-colors ${
          note.is_pinned 
            ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' 
            : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
        }`}
        title={note.is_pinned ? "Remove from favorites" : "Add to favorites"}
      >
        <svg className="w-4 h-4" fill={note.is_pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
        title="Share note"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        title="Delete note"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );

  if (view === 'list') {
    return (
      <div
        onClick={handleClick}
        className={`group relative ${themeClasses.cardBackground} border rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer ${themeClasses.cardBorder} ${themeClasses.cardHover} ${themeClasses.shadowColor} shadow-lg`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate pr-2 group-hover:text-blue-600 transition-colors">
                {note.title || 'Untitled Note'}
              </h3>
              <div className="flex items-center gap-2">
                <ActionButtons />
                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">{formatDateTime(note.updated_at)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 flex-1">
                {getPreview(note.content || '', 60)}
              </p>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2 sm:hidden">{formatDateTime(note.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        <ShareModal
          note={note}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative ${themeClasses.cardBackground} border rounded-xl p-4 sm:p-5 transition-all duration-300 cursor-pointer flex flex-col h-56 sm:h-64 ${themeClasses.cardBorder} ${themeClasses.cardHover} ${themeClasses.shadowColor} shadow-lg`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors pr-2">
          {note.title || 'Untitled Note'}
        </h3>
        <ActionButtons />
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {getPreview(note.content || '', 120)}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
        <span className="truncate">{formatDateTime(note.updated_at)}</span>
        <div className="flex items-center gap-2 ml-2">
          {note.is_pinned && <span title="Favorited" className="text-yellow-500">⭐</span>}
          {note.is_archived && <span title="Archived">📦</span>}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        note={note}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}