'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';
import type { Note } from '@/types/database';
import { formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await noteService.getNotes(user.id, {}, { field: 'updated_at', direction: 'desc' });
      setNotes(result.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="container-custom py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.email}!</p>
            </div>
            <Link
              href="/notes/new"
              className="btn-primary"
            >
              New Note
            </Link>
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Notes List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Notes ({filteredNotes.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading notes...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                {searchQuery ? (
                  <div>
                    <p className="text-gray-500 mb-4">No notes found matching "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">No notes yet. Start by creating your first note!</p>
                    <Link href="/notes/new" className="btn-primary">
                      Create Your First Note
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {note.title || 'Untitled Note'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {note.excerpt || 'No content'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>Updated {formatDateTime(note.updated_at)}</span>
                          {note.word_count > 0 && (
                            <span>{note.word_count} words</span>
                          )}
                          {note.reading_time > 0 && (
                            <span>{note.reading_time} min read</span>
                          )}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Notes</h3>
            <p className="text-3xl font-bold text-blue-600">{notes.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {notes.length === 0 ? 'Start creating notes' : 'Keep writing!'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Words Written</h3>
            <p className="text-3xl font-bold text-green-600">
              {notes.reduce((total, note) => total + (note.word_count || 0), 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total word count</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reading Time</h3>
            <p className="text-3xl font-bold text-purple-600">
              {notes.reduce((total, note) => total + (note.reading_time || 0), 0)} min
            </p>
            <p className="text-sm text-gray-500 mt-1">Total reading time</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}