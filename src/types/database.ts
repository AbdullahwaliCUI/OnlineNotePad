// Database types generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          full_name: string | null;
          phone: string | null;
          phone_e164: string | null;
          whatsapp_opt_in: boolean;
          avatar_url: string | null;
          bio: string | null;
          preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          full_name?: string | null;
          phone?: string | null;
          phone_e164?: string | null;
          whatsapp_opt_in?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          full_name?: string | null;
          phone?: string | null;
          phone_e164?: string | null;
          whatsapp_opt_in?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          content_html: string;
          excerpt: string;
          is_public: boolean;
          is_shared: boolean;
          share_id: string;
          is_archived: boolean;
          is_pinned: boolean;
          folder_id: string | null;
          word_count: number;
          reading_time: number;
          last_viewed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string;
          content_html?: string;
          is_public?: boolean;
          is_shared?: boolean;
          share_id?: string;
          is_archived?: boolean;
          is_pinned?: boolean;
          folder_id?: string | null;
          word_count?: number;
          reading_time?: number;
          last_viewed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          content_html?: string;
          is_public?: boolean;
          is_shared?: boolean;
          share_id?: string;
          is_archived?: boolean;
          is_pinned?: boolean;
          folder_id?: string | null;
          word_count?: number;
          reading_time?: number;
          last_viewed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          icon: string;
          parent_id: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          icon?: string;
          parent_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          parent_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      note_tags: {
        Row: {
          id: string;
          note_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      shared_notes: {
        Row: {
          id: string;
          note_id: string;
          shared_by: string;
          shared_with: string | null;
          share_token: string;
          permission: 'read' | 'comment' | 'edit';
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          shared_by: string;
          shared_with?: string | null;
          share_token?: string;
          permission?: 'read' | 'comment' | 'edit';
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          shared_by?: string;
          shared_with?: string | null;
          share_token?: string;
          permission?: 'read' | 'comment' | 'edit';
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      note_versions: {
        Row: {
          id: string;
          note_id: string;
          title: string;
          content: string;
          content_html: string;
          version_number: number;
          change_summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          title: string;
          content: string;
          content_html: string;
          version_number: number;
          change_summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          title?: string;
          content?: string;
          content_html?: string;
          version_number?: number;
          change_summary?: string | null;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          metadata: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          metadata?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          metadata?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      notes_with_tags: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          content_html: string;
          excerpt: string;
          is_public: boolean;
          is_archived: boolean;
          is_pinned: boolean;
          folder_id: string | null;
          word_count: number;
          reading_time: number;
          last_viewed_at: string;
          created_at: string;
          updated_at: string;
          tags: Array<{
            id: string;
            name: string;
            color: string;
          }>;
        };
      };
      folder_hierarchy: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          icon: string;
          parent_id: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
          level: number;
          path: string[];
          full_path: string;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Note = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export type Folder = Database['public']['Tables']['folders']['Row'];
export type FolderInsert = Database['public']['Tables']['folders']['Insert'];
export type FolderUpdate = Database['public']['Tables']['folders']['Update'];

export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];

export type NoteTag = Database['public']['Tables']['note_tags']['Row'];
export type NoteTagInsert = Database['public']['Tables']['note_tags']['Insert'];

export type SharedNote = Database['public']['Tables']['shared_notes']['Row'];
export type SharedNoteInsert = Database['public']['Tables']['shared_notes']['Insert'];
export type SharedNoteUpdate = Database['public']['Tables']['shared_notes']['Update'];

export type NoteVersion = Database['public']['Tables']['note_versions']['Row'];
export type NoteVersionInsert = Database['public']['Tables']['note_versions']['Insert'];

export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

// View types
export type NoteWithTags = Database['public']['Views']['notes_with_tags']['Row'];
export type FolderHierarchy = Database['public']['Views']['folder_hierarchy']['Row'];

// Extended types for application use
export interface NoteWithDetails extends Note {
  tags?: Tag[];
  folder?: Folder;
  shared_notes?: SharedNote[];
  version_count?: number;
}

export interface FolderWithNotes extends Folder {
  notes?: Note[];
  note_count?: number;
  children?: FolderWithNotes[];
}

export interface TagWithCount extends Tag {
  note_count?: number;
}

// Search and filter types
export interface NoteFilters {
  search?: string;
  folder_id?: string;
  tag_ids?: string[];
  is_public?: boolean;
  is_archived?: boolean;
  is_pinned?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface NoteSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'word_count' | 'reading_time';
  direction: 'asc' | 'desc';
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}