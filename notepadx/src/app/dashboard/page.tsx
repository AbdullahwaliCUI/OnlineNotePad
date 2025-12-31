'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmptyState from '@/components/ui/EmptyState';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await noteService.getNotes(user.id, {}, { field: 'updated_at', direction: 'desc' });
      setNotes(result.data as unknown as Note[]);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Failed to load notes. Please try again.');
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadNotes();
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWords = notes.reduce((total, note) => total + (note.word_count || 0), 0);
  const totalReadingTime = notes.reduce((total, note) => total + (note.reading_time || 0), 0);

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
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </Link>
          </div>
        </div>

        {/* Search Box */}
        {!loading && notes.length > 0 && (
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
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading your notes...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <EmptyState
              icon={
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Failed to Load Notes"
              description={error}
              actionText="Try Again"
              onAction={handleRetry}
            />
          </div>
        )}

        {/* Empty State - No Notes */}
        {!loading && !error && notes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <EmptyState
              icon={
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="No Notes Yet"
              description="Start your journey by creating your first note. Capture your thoughts, ideas, and inspiration in one place."
              actionText="Create Your First Note"
              actionHref="/notes/new"
            />
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && notes.length > 0 && filteredNotes.length === 0 && searchQuery && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <EmptyState
              icon={
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No Results Found"
              description={`No notes found matching "${searchQuery}". Try a different search term or create a new note.`}
              actionText="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          </div>
        )}

        {/* Notes List */}
        {!loading && !error && filteredNotes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Notes ({filteredNotes.length})
                </h2>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear search
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
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
                        {note.is_shared && (
                          <span className="text-green-500" title="Shared">
                            🔗
                          </span>
                        )}
                        {note.is_public && (
                          <span className="text-blue-500" title="Public">
                            🌐
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && !error && notes.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Notes</h3>
                  <p className="text-3xl font-bold text-blue-600">{notes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Words Written</h3>
                  <p className="text-3xl font-bold text-green-600">{totalWords.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reading Time</h3>
                  <p className="text-3xl font-bold text-purple-600">{totalReadingTime} min</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}