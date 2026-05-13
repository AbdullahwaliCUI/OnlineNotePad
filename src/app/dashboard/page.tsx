'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import EmptyState from '@/components/ui/EmptyState';
import DashboardHeader from '@/components/DashboardHeader';
import NoteCard from '@/components/NoteCard';
import { useAuth } from '@/hooks/useAuth';
import { noteService, searchService } from '@/lib/database';
import { useTheme } from '@/contexts/ThemeContext';
import type { Note } from '@/types/database';
import { supabase } from '@/lib/supabaseClient';
import type { VaultItem, VaultCategory } from '@/types/vault';
import VaultItemCard from '@/components/vault/VaultItemCard';
import VaultItemModal from '@/components/vault/VaultItemModal';

// Generic wrapper to unify dashboard items
type DashboardItem = 
  | { type: 'note', data: Note, date: number, pinned: boolean }
  | { type: 'vault', data: VaultItem, date: number, pinned: boolean };

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>('');

  // Vault Items State
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [vaultCategories, setVaultCategories] = useState<VaultCategory[]>([]);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [editingVaultItem, setEditingVaultItem] = useState<VaultItem | null>(null);
  const [activeVaultCategoryType, setActiveVaultCategoryType] = useState<string>('Password');

  // Handle hydration & URL params
  useEffect(() => {
    setMounted(true);
    
    // Get filter from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter') || '';
    setFilter(filterParam);

    // Check for "new" param (from NewItemDropdown)
    const newParam = urlParams.get('new');
    if (newParam) {
      setActiveVaultCategoryType(newParam);
      setEditingVaultItem(null);
      setIsVaultModalOpen(true);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  // Handle authentication and notes loading
  useEffect(() => {
    if (!mounted) return;

    if (!authLoading && !user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user?.id) {
      loadNotes();
    }
  }, [user?.id, authLoading, mounted, router]);

  const loadNotes = async () => {
    if (!user) return;

    setNotesLoading(true);
    setError(null);

    try {
      // 1. Fetch Notes
      const result = await noteService.getNotes(user.id, {}, { field: 'updated_at', direction: 'desc' });
      setNotes(result.data as unknown as Note[]);

      // 2. Fetch Vault Items
      const { data: itemData, error: itemError } = await supabase
        .from('vault_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!itemError && itemData) {
        setVaultItems(itemData);
      }

      // 3. Fetch Vault Categories (needed for saving new vault items)
      const { data: catData } = await supabase
        .from('vault_categories')
        .select('*');
      if (catData) setVaultCategories(catData);

    } catch (error) {
      console.error('Error loading dashboard items:', error);
      setError('Failed to load items. Please try again.');
      toast.error('Failed to load items');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleRetry = () => {
    loadNotes();
  };

  // Unify and sort items
  const combinedItems: DashboardItem[] = [
    ...notes.map(n => ({ type: 'note' as const, data: n, date: new Date(n.updated_at).getTime(), pinned: !!n.is_pinned })),
    ...vaultItems.map(v => ({ type: 'vault' as const, data: v, date: new Date(v.updated_at || v.created_at).getTime(), pinned: !!v.is_favorite }))
  ];

  const filteredItems = combinedItems
    .filter(item => {
      // Search filter
      const title = item.type === 'note' ? item.data.title : item.data.title;
      const content = item.type === 'note' ? item.data.content : (item.data.notes || '');
      const matchesSearch = (title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (content || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Type/Category filter
      switch (filter) {
        case 'pinned':
          return item.pinned;
        case 'archived':
          return item.type === 'note' ? item.data.is_archived : false;
        case 'all':
          return item.type === 'note' ? !item.data.is_archived : true;
        case 'vault':
          return item.type === 'vault';
        case 'notes':
          return item.type === 'note' && !item.data.is_archived;
        // Map other filters to vault categories if needed
        default:
          // Default: show active notes and all vault items
          return item.type === 'note' ? !item.data.is_archived : true;
      }
    })
    .sort((a, b) => {
      // First sort by pinned status (pinned items first)
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Then sort by date (newest first)
      return b.date - a.date;
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
    // The share functionality is now handled by the ShareModal in NoteCard
    // This function is kept for compatibility but the actual sharing is done in the modal
    console.log('Share note:', note.title);
  };

  const handleTogglePin = async (note: Note) => {
    try {
      // Check if trying to pin and already have 8 pinned notes
      if (!note.is_pinned) {
        const pinnedCount = notes.filter(n => n.is_pinned).length;
        if (pinnedCount >= 8) {
          toast.error('Maximum 8 notes can be pinned (2 rows). Please unpin a note first.');
          return;
        }
      }

      console.log('Toggling pin for note:', note.id, 'Current status:', note.is_pinned);
      
      // Show loading state
      const loadingToast = toast.loading(note.is_pinned ? 'Unpinning note...' : 'Pinning note...');
      
      const success = await searchService.togglePin(note.id);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (success) {
        // Update the note in the local state
        setNotes(notes.map(n => 
          n.id === note.id 
            ? { ...n, is_pinned: !n.is_pinned }
            : n
        ));
        toast.success(note.is_pinned ? 'Note unpinned' : 'Note pinned');
      } else {
        console.error('togglePin returned false');
        toast.error('Failed to update note. Please check your permissions.');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('An error occurred while updating pin status');
    }
  };

  const handleToggleArchive = async (note: Note) => {
    try {
      const success = await searchService.toggleArchive(note.id);
      
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

  // Vault Actions
  const handleSaveVaultItem = async (itemData: Partial<VaultItem>) => {
    if (!user) return;
    try {
      if (itemData.id) {
        // Update
        const { data, error } = await supabase
          .from('vault_items')
          .update(itemData)
          .eq('id', itemData.id)
          .select()
          .single();
        if (error) throw error;
        setVaultItems(vaultItems.map(item => item.id === data.id ? data : item));
        toast.success('Item updated successfully');
      } else {
        // Insert
        // Ensure category exists, else fallback
        let categoryId = itemData.category_id;
        if (!categoryId && vaultCategories.length > 0) {
           categoryId = vaultCategories[0].id;
        } else if (!categoryId) {
           // Create default category if none exists
           const { data: newCat } = await supabase
             .from('vault_categories')
             .insert([{ name: 'General', user_id: user.id }])
             .select()
             .single();
           if (newCat) {
             setVaultCategories([newCat]);
             categoryId = newCat.id;
           }
        }

        const { data, error } = await supabase
          .from('vault_items')
          .insert([{ ...itemData, category_id: categoryId, user_id: user.id }])
          .select()
          .single();
        if (error) throw error;
        setVaultItems([data, ...vaultItems]);
        toast.success('Item saved securely');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to save vault item');
      throw error;
    }
  };

  const handleDeleteVaultItem = async (id: string) => {
    try {
      const { error } = await supabase.from('vault_items').delete().eq('id', id);
      if (error) throw error;
      setVaultItems(vaultItems.filter(item => item.id !== id));
      toast.success('Vault item deleted');
    } catch (error) {
      toast.error('Failed to delete vault item');
    }
  };

  const openVaultEditModal = (item: VaultItem) => {
    setEditingVaultItem(item);
    setActiveVaultCategoryType(item.item_type || 'Password');
    setIsVaultModalOpen(true);
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
    <div className={`space-y-6 min-h-screen ${themeClasses.background}`}>
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="mt-6">
        {combinedItems.length === 0 ? (
          <EmptyState
            title="No items yet"
            description="Create your first note or secure vault item to get started."
            actionText="Create Item"
            actionHref="/notes/new"
          />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${themeClasses.primaryText}`}>No items found</h3>
            <p className="text-muted-foreground mb-4">
              No items match your search for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary hover:text-primary/90 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className={`hidden sm:flex items-center py-3 px-4 border-b ${themeClasses.cardBorder} text-sm font-medium text-gray-500 dark:text-gray-400 ${themeClasses.statsBackground} rounded-t-xl`}>
                <div className="flex-1 ml-10">Name</div>
                <div className="hidden md:block w-32">Owned by</div>
                <div className="w-40">Last modified</div>
                <div className="w-32 text-right">Actions</div>
              </div>
            )}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : `${themeClasses.cardBackground} rounded-b-xl border-x border-b ${themeClasses.cardBorder} overflow-hidden shadow-sm`
            }>
              {filteredItems.map((item) => {
                if (item.type === 'note') {
                  return (
                    <NoteCard
                      key={`note-${item.data.id}`}
                      note={item.data}
                      view={viewMode}
                      onDelete={handleDeleteNote}
                      onShare={handleShareNote}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                    />
                  );
                } else {
                  // If we are in list mode, we might want a different rendering for VaultItems,
                  // but for now we render VaultItemCard (which we might need to adjust for list view later)
                  return (
                    <VaultItemCard
                      key={`vault-${item.data.id}`}
                      item={item.data}
                      onEdit={openVaultEditModal}
                      onDelete={handleDeleteVaultItem}
                    />
                  );
                }
              })}
            </div>
          </>
        )}

        {/* Simple footer for filtered results */}
        {filteredItems.length > 0 && searchQuery && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          </div>
        )}
      </div>

      {/* Unified Vault Modal */}
      <VaultItemModal 
        isOpen={isVaultModalOpen}
        onClose={() => { setIsVaultModalOpen(false); setEditingVaultItem(null); }}
        onSave={handleSaveVaultItem}
        item={editingVaultItem}
        categoryId={editingVaultItem?.category_id || (vaultCategories.length > 0 ? vaultCategories[0].id : null)}
        defaultType={activeVaultCategoryType}
      />
    </div>
  );
}