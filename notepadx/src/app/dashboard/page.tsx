'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import DashboardHeader from '@/components/DashboardHeader';
import NoteCard from '@/components/NoteCard';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';
import type { Note } from '@/types/database';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>('');

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    
    // Get filter from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter') || '';
    setFilter(filterParam);
  }, []);

  // Handle authentication and notes loading
  useEffect(() => {
    if (!mounted) return;

    if (!authLoading && !user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user) {
      loadNotes();
    }
  }, [user, authLoading, mounted, router]);

  const loadNotes = async () => {
    if (!user) return;

    setNotesLoading(true);
    setError(null);

    try {
      const result = await noteService.getNotes(user.id, {}, { field: 'updated_at', direction: 'desc' });
      setNotes(result.data as unknown as Note[]);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Failed to load notes. Please try again.');
      toast.error('Failed to load notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleRetry = () => {
    loadNotes();
  };

  // Filter notes based on search query and filter type
  const filteredNotes = notes.filter(note => {
    // First apply search filter
    const matchesSearch = (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply type filter
    switch (filter) {
      case 'pinned':
        return note.is_pinned;
      case 'archived':
        return note.is_archived;
      default:
        return !note.is_archived; // Show only non-archived notes by default
    }
  });

  const handleDeleteNote = async (note: Note) => {
    try {
      const success = await noteService.deleteNote(note.id);
      if (success) {
        setNotes(notes.filter((n) => n.id !== note.id));
        toast.success('Note moved to trash');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('An error occurred');
    }
  };

  const handleShareNote = async (note: Note) => {
    // For now, we'll just show a toast since sharing logic might require a modal
    // In a real implementation, this would open a share dialog
    const url = `${window.location.origin}/notes/${note.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Note link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      const success = await (noteService as any).togglePin(note.id);
      if (success) {
        // Update the note in the local state
        setNotes(notes.map(n => 
          n.id === note.id 
            ? { ...n, is_pinned: !n.is_pinned }
            : n
        ));
        toast.success(note.is_pinned ? 'Note unpinned' : 'Note pinned');
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('An error occurred');
    }
  };

  const handleToggleArchive = async (note: Note) => {
    try {
      const success = await (noteService as any).toggleArchive(note.id);
      if (success) {
        // Update the note in the local state
        setNotes(notes.map(n => 
          n.id === note.id 
            ? { ...n, is_archived: !n.is_archived }
            : n
        ));
        toast.success(note.is_archived ? 'Note unarchived' : 'Note archived');
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast.error('An error occurred');
    }
  };

  // Show loading during hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (authLoading || (notesLoading && user)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{authLoading ? 'Checking authentication...' : 'Loading your notes...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={handleRetry} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="mt-6">
        {notes.length === 0 ? (
          <EmptyState
            title="No notes yet"
            description="Create your first note to get started with your digital notebook."
            actionText="Create Note"
            actionHref="/notes/new"
          />
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              No notes match your search for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary hover:text-primary/90 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                view={viewMode}
                onDelete={handleDeleteNote}
                onShare={handleShareNote}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
              />
            ))}
          </div>
        )}

        {/* Quick Stats Footer */}
        {filteredNotes.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredNotes.length} of {notes.length} notes
              {searchQuery && (
                <span className="ml-2">
                  • Filtered by "{searchQuery}"
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}