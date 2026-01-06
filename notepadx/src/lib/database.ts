import { supabase } from './supabaseClient';
import type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Note,
  NoteInsert,
  NoteUpdate,
  NoteWithTags,
  Folder,
  FolderInsert,
  FolderUpdate,
  Tag,
  TagInsert,
  TagUpdate,
  NoteFilters,
  NoteSortOptions,
  PaginatedResponse,
} from '@/types/database';

// =============================================
// PROFILE OPERATIONS
// =============================================

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    console.log('Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('Profile fetched successfully:', data);
    return data;
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    console.log('Updating profile for user:', userId, 'with updates:', updates);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('Profile updated successfully:', data);
    return data;
  },

  async createProfile(profile: ProfileInsert): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data;
  },

  async getCurrentUserProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    return this.getProfile(user.id);
  },

  async updateCurrentUserProfile(updates: ProfileUpdate): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    return this.updateProfile(user.id, updates);
  },
};

// =============================================
// NOTE OPERATIONS
// =============================================

export const noteService = {
  async getNotes(
    userId: string,
    filters: NoteFilters = {},
    sort: NoteSortOptions = { field: 'updated_at', direction: 'desc' },
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedResponse<NoteWithTags>> {
    let query = supabase
      .from('notes_with_tags')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters.folder_id) {
      query = query.eq('folder_id', filters.folder_id);
    }

    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    if (filters.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived);
    }

    if (filters.is_pinned !== undefined) {
      query = query.eq('is_pinned', filters.is_pinned);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching notes:', error);
      return {
        data: [],
        count: 0,
        page,
        per_page: perPage,
        total_pages: 0,
      };
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  },

  async getNote(noteId: string, userId: string): Promise<NoteWithTags | null> {
    const { data, error } = await supabase
      .from('notes_with_tags')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching note:', error);
      return null;
    }

    return data;
  },

  async getPublicNote(shareId: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('share_id', shareId)
      .eq('is_shared', true)
      .single();

    if (error) {
      console.error('Error fetching public note:', error);
      return null;
    }

    return data;
  },

  async createNote(note: NoteInsert): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    return data;
  },

  async updateNote(noteId: string, updates: NoteUpdate): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return null;
    }

    return data;
  },

  async deleteNote(noteId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }

    return true;
  },

  async duplicateNote(noteId: string, userId: string): Promise<Note | null> {
    // First get the original note
    const { data: originalNote, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !originalNote) {
      console.error('Error fetching original note:', fetchError);
      return null;
    }

    // Create a copy
    const { id, created_at, updated_at, ...noteData } = originalNote;
    const duplicatedNote: NoteInsert = {
      ...noteData,
      title: `${originalNote.title} (Copy)`,
    };

    return this.createNote(duplicatedNote);
  },

  async updateLastViewed(noteId: string): Promise<void> {
    await supabase
      .from('notes')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('id', noteId);
  },
};

// =============================================
// FOLDER OPERATIONS
// =============================================

export const folderService = {
  async getFolders(userId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching folders:', error);
      return [];
    }

    return data || [];
  },

  async getFolder(folderId: string, userId: string): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching folder:', error);
      return null;
    }

    return data;
  },

  async createFolder(folder: FolderInsert): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .insert(folder)
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      return null;
    }

    return data;
  },

  async updateFolder(folderId: string, updates: FolderUpdate): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', folderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating folder:', error);
      return null;
    }

    return data;
  },

  async deleteFolder(folderId: string): Promise<boolean> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);

    if (error) {
      console.error('Error deleting folder:', error);
      return false;
    }

    return true;
  },

  async getFolderHierarchy(userId: string) {
    const { data, error } = await supabase
      .from('folder_hierarchy')
      .select('*')
      .eq('user_id', userId)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching folder hierarchy:', error);
      return [];
    }

    return data || [];
  },
};

// =============================================
// TAG OPERATIONS
// =============================================

export const tagService = {
  async getTags(userId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    return data || [];
  },

  async getTag(tagId: string, userId: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tagId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching tag:', error);
      return null;
    }

    return data;
  },

  async createTag(tag: TagInsert): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      return null;
    }

    return data;
  },

  async updateTag(tagId: string, updates: TagUpdate): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tag:', error);
      return null;
    }

    return data;
  },

  async deleteTag(tagId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
      return false;
    }

    return true;
  },

  async addTagToNote(noteId: string, tagId: string): Promise<boolean> {
    const { error } = await supabase
      .from('note_tags')
      .insert({ note_id: noteId, tag_id: tagId });

    if (error) {
      console.error('Error adding tag to note:', error);
      return false;
    }

    return true;
  },

  async removeTagFromNote(noteId: string, tagId: string): Promise<boolean> {
    const { error } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .eq('tag_id', tagId);

    if (error) {
      console.error('Error removing tag from note:', error);
      return false;
    }

    return true;
  },

  async updateNoteTags(noteId: string, tagIds: string[]): Promise<boolean> {
    // First, remove all existing tags for this note
    const { error: deleteError } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId);

    if (deleteError) {
      console.error('Error removing existing tags:', deleteError);
      return false;
    }

    // Then, add the new tags
    if (tagIds.length > 0) {
      const noteTagInserts = tagIds.map(tagId => ({
        note_id: noteId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from('note_tags')
        .insert(noteTagInserts);

      if (insertError) {
        console.error('Error adding new tags:', insertError);
        return false;
      }
    }

    return true;
  },
};

// =============================================
// SEARCH OPERATIONS
// =============================================

export const searchService = {
  async searchNotes(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<NoteWithTags[]> {
    const { data, error } = await supabase
      .from('notes_with_tags')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching notes:', error);
      return [];
    }

    return data || [];
  },

  async getRecentNotes(userId: string, limit: number = 5): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('last_viewed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent notes:', error);
      return [];
    }

    return data || [];
  },

  async getPinnedNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_pinned', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pinned notes:', error);
      return [];
    }

    return data || [];
  },

  async togglePin(noteId: string): Promise<boolean> {
    try {
      console.log('togglePin called for noteId:', noteId);
      
      // Use noteService.updateNote instead of direct supabase call
      const { data: currentNote, error: fetchError } = await supabase
        .from('notes')
        .select('is_pinned, user_id')
        .eq('id', noteId)
        .single();

      if (fetchError) {
        console.error('Error fetching note pin status:', fetchError);
        return false;
      }

      if (!currentNote) {
        console.error('Note not found with id:', noteId);
        return false;
      }

      console.log('Current pin status:', currentNote.is_pinned, 'Toggling to:', !currentNote.is_pinned);

      // Use noteService.updateNote for proper permissions
      const updatedNote = await noteService.updateNote(noteId, {
        is_pinned: !currentNote.is_pinned,
        updated_at: new Date().toISOString()
      });

      if (updatedNote) {
        console.log('Pin status updated successfully');
        return true;
      } else {
        console.error('Failed to update note via noteService');
        return false;
      }
    } catch (error) {
      console.error('Error in togglePin:', error);
      return false;
    }
  },

  async toggleArchive(noteId: string): Promise<boolean> {
    try {
      // First get the current archive status
      const { data: currentNote, error: fetchError } = await supabase
        .from('notes')
        .select('is_archived')
        .eq('id', noteId)
        .single();

      if (fetchError) {
        console.error('Error fetching note archive status:', fetchError);
        return false;
      }

      // Toggle the archive status
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_archived: !currentNote.is_archived,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (error) {
        console.error('Error toggling archive status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in toggleArchive:', error);
      return false;
    }
  },
};

// =============================================
// STATISTICS
// =============================================

export const statsService = {
  async getUserStats(userId: string) {
    const [notesResult, foldersResult, tagsResult] = await Promise.all([
      supabase
        .from('notes')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      supabase
        .from('folders')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      supabase
        .from('tags')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
    ]);

    return {
      totalNotes: notesResult.count || 0,
      totalFolders: foldersResult.count || 0,
      totalTags: tagsResult.count || 0,
    };
  },

  async getWordCountStats(userId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('word_count, reading_time')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching word count stats:', error);
      return { totalWords: 0, totalReadingTime: 0 };
    }

    const totalWords = data?.reduce((sum, note) => sum + (note.word_count || 0), 0) || 0;
    const totalReadingTime = data?.reduce((sum, note) => sum + (note.reading_time || 0), 0) || 0;

    return { totalWords, totalReadingTime };
  },
};