'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDateTime } from '@/lib/utils';
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

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on actions
    if ((e.target as HTMLElement).closest('button')) return;
    router.push(`/notes/${note.id}`);
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
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {onTogglePin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          className={`p-1.5 rounded-md transition-colors ${
            note.is_pinned 
              ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
              : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
          }`}
          title={note.is_pinned ? "Unpin note" : "Pin note"}
        >
          <svg className="w-4 h-4" fill={note.is_pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}
      {onToggleArchive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleArchive(note);
          }}
          className={`p-1.5 rounded-md transition-colors ${
            note.is_archived 
              ? 'text-green-600 bg-green-50 hover:bg-green-100' 
              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
          }`}
          title={note.is_archived ? "Unarchive note" : "Archive note"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18v4H3z" />
          </svg>
        </button>
      )}
      {onShare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(note);
          }}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Share note"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this note?')) {
              onDelete(note);
            }
          }}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete note"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );

  if (view === 'list') {
    return (
      <div
        onClick={handleClick}
        className={`group relative ${themeClasses.cardBackground} border rounded-xl p-4 transition-all duration-300 cursor-pointer ${themeClasses.cardBorder} ${themeClasses.cardHover} ${themeClasses.shadowColor} shadow-lg`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate pr-4 group-hover:text-blue-600 transition-colors">
                {note.title || 'Untitled Note'}
              </h3>
              <div className="flex items-center gap-2">
                <ActionButtons />
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(note.updated_at)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {getPreview(note.content || '', 80)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative ${themeClasses.cardBackground} border rounded-xl p-5 transition-all duration-300 cursor-pointer flex flex-col h-64 ${themeClasses.cardBorder} ${themeClasses.cardHover} ${themeClasses.shadowColor} shadow-lg`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {note.title || 'Untitled Note'}
        </h3>
        <ActionButtons />
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {getPreview(note.content || '', 150)}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
        <span>{formatDateTime(note.updated_at)}</span>
        <div className="flex items-center gap-2">
          {note.is_pinned && <span title="Pinned">📌</span>}
          {note.is_archived && <span title="Archived">📦</span>}
        </div>
      </div>
    </div>
  );
}