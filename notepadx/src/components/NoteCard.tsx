'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/utils';
import type { Note } from '@/types/database';

interface NoteCardProps {
  note: Note;
  view?: 'grid' | 'list';
}

export default function NoteCard({ note, view = 'grid' }: NoteCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/notes/${note.id}`);
  };

  if (view === 'list') {
    return (
      <div
        onClick={handleClick}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
              {note.title || 'Untitled Note'}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {note.excerpt || 'No content'}
            </p>
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              <span>Updated {formatDateTime(note.updated_at)}</span>
              {note.word_count > 0 && <span>{note.word_count} words</span>}
              {note.reading_time > 0 && <span>{note.reading_time} min read</span>}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {note.is_pinned && (
              <span className="text-yellow-500" title="Pinned">
                📌
              </span>
            )}
            {note.is_public && (
              <span className="text-green-500" title="Public">
                🌐
              </span>
            )}
            {note.is_archived && (
              <span className="text-gray-500" title="Archived">
                📦
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group h-64 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
          {note.title || 'Untitled Note'}
        </h3>
        <div className="flex items-center space-x-1 ml-2">
          {note.is_pinned && (
            <span className="text-yellow-500 text-sm" title="Pinned">📌</span>
          )}
          {note.is_public && (
            <span className="text-green-500 text-sm" title="Public">🌐</span>
          )}
          {note.is_archived && (
            <span className="text-gray-500 text-sm" title="Archived">📦</span>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-4 flex-1">
        {note.excerpt || 'No content'}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>Updated {formatDateTime(note.updated_at)}</span>
        <div className="flex items-center space-x-3">
          {note.word_count > 0 && <span>{note.word_count} words</span>}
          {note.reading_time > 0 && <span>{note.reading_time} min</span>}
        </div>
      </div>
    </div>
  );
}