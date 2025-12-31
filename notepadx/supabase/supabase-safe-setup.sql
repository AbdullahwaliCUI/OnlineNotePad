-- =============================================
-- NotepadX Database Schema for Supabase (Safe Setup)
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FOLDERS TABLE (Created before notes because of foreign key)
-- =============================================
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'folder',
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name, parent_id)
);

-- =============================================
-- NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    content_html TEXT NOT NULL DEFAULT '',
    excerpt TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN LENGTH(content) > 200 THEN LEFT(content, 200) || '...'
            ELSE content
        END
    ) STORED,
    is_public BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    share_id UUID DEFAULT uuid_generate_v4(),
    is_archived BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TAGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- =============================================
-- NOTE_TAGS JUNCTION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.note_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(note_id, tag_id)
);

-- =============================================
-- SHARED_NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.shared_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    shared_with UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
    permission TEXT CHECK (permission IN ('read', 'comment', 'edit')) DEFAULT 'read',
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTE_VERSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.note_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(note_id, version_number)
);

-- =============================================
-- ACTIVITY_LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES (Only separate if they don't exist is harder in pure SQL without PL/pgSQL, 
-- but usually CREATE INDEX IF NOT EXISTS works in newer Postgres, Supabase uses Postgres 15+)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON public.notes(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON public.notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON public.notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_title_search ON public.notes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_notes_content_search ON public.notes USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_sort_order ON public.folders(sort_order);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON public.note_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_shared_notes_note_id ON public.shared_notes(note_id);
CREATE INDEX IF NOT EXISTS idx_shared_notes_shared_with ON public.shared_notes(shared_with);
CREATE INDEX IF NOT EXISTS idx_shared_notes_share_token ON public.shared_notes(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_notes_is_active ON public.shared_notes(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate note stats
CREATE OR REPLACE FUNCTION calculate_note_stats()
RETURNS TRIGGER AS $$
BEGIN
    NEW.word_count = array_length(string_to_array(trim(regexp_replace(NEW.content, '<[^>]*>', '', 'g')), ' '), 1);
    NEW.reading_time = GREATEST(1, CEIL(NEW.word_count::float / 200));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO NOTHING; -- Handle existing profiles
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    action_name TEXT;
    user_id_val UUID;
BEGIN
    CASE TG_OP
        WHEN 'INSERT' THEN action_name = 'created';
        WHEN 'UPDATE' THEN action_name = 'updated';
        WHEN 'DELETE' THEN action_name = 'deleted';
    END CASE;
    
    IF TG_OP = 'DELETE' THEN
        user_id_val = OLD.user_id;
    ELSE
        user_id_val = NEW.user_id;
    END IF;
    
    INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, metadata)
    VALUES (
        user_id_val,
        action_name,
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        '{}'::jsonb
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Triggers (Drop first to avoid errors if they exist, or use DO block)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folders_updated_at ON public.folders;
CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shared_notes_updated_at ON public.shared_notes;
CREATE TRIGGER update_shared_notes_updated_at
    BEFORE UPDATE ON public.shared_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS calculate_note_stats_trigger ON public.notes;
CREATE TRIGGER calculate_note_stats_trigger
    BEFORE INSERT OR UPDATE OF content ON public.notes
    FOR EACH ROW EXECUTE FUNCTION calculate_note_stats();

DROP TRIGGER IF EXISTS log_notes_activity ON public.notes;
CREATE TRIGGER log_notes_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_folders_activity ON public.folders;
CREATE TRIGGER log_folders_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Re-create policies (Drop first/IF NOT EXISTS isn't standard for Policies in all Postgres versions, so DROP IF EXISTS is safer)

DO $$ 
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    
    -- Notes
    DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
    DROP POLICY IF EXISTS "Users can view public notes" ON public.notes;
    DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
    DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
    DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;

    -- Folders
    DROP POLICY IF EXISTS "Users can manage own folders" ON public.folders;
    
    -- Tags
    DROP POLICY IF EXISTS "Users can manage own tags" ON public.tags;
    
    -- Note Tags
    DROP POLICY IF EXISTS "Users can manage tags for own notes" ON public.note_tags;

    -- Shared Notes
    DROP POLICY IF EXISTS "Users can view shares for own notes" ON public.shared_notes;
    DROP POLICY IF EXISTS "Users can create shares for own notes" ON public.shared_notes;
    DROP POLICY IF EXISTS "Users can update shares for own notes" ON public.shared_notes;
    DROP POLICY IF EXISTS "Users can delete shares for own notes" ON public.shared_notes;

    -- Note Versions
    DROP POLICY IF EXISTS "Users can view versions of own notes" ON public.note_versions;

    -- Activity Logs
    DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
END $$;

-- Create Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public notes" ON public.notes
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own folders" ON public.folders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tags" ON public.tags
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage tags for own notes" ON public.note_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view shares for own notes" ON public.shared_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = shared_notes.note_id 
            AND notes.user_id = auth.uid()
        )
        OR shared_with = auth.uid()
    );

CREATE POLICY "Users can create shares for own notes" ON public.shared_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = shared_notes.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update shares for own notes" ON public.shared_notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = shared_notes.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete shares for own notes" ON public.shared_notes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = shared_notes.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view versions of own notes" ON public.note_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_versions.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own activity" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- VIEWS
-- =============================================
DROP VIEW IF EXISTS public.notes_with_tags;
CREATE OR REPLACE VIEW public.notes_with_tags AS
SELECT 
    n.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', t.id,
                'name', t.name,
                'color', t.color
            )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
    ) as tags
FROM public.notes n
LEFT JOIN public.note_tags nt ON n.id = nt.note_id
LEFT JOIN public.tags t ON nt.tag_id = t.id
GROUP BY n.id;

DROP VIEW IF EXISTS public.folder_hierarchy;
CREATE OR REPLACE VIEW public.folder_hierarchy AS
WITH RECURSIVE folder_tree AS (
    SELECT 
        id,
        user_id,
        name,
        description,
        color,
        icon,
        parent_id,
        sort_order,
        created_at,
        updated_at,
        0 as level,
        ARRAY[name] as path,
        name as full_path
    FROM public.folders
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        f.id,
        f.user_id,
        f.name,
        f.description,
        f.color,
        f.icon,
        f.parent_id,
        f.sort_order,
        f.created_at,
        f.updated_at,
        ft.level + 1,
        ft.path || f.name,
        ft.full_path || ' > ' || f.name
    FROM public.folders f
    JOIN folder_tree ft ON f.parent_id = ft.id
)
SELECT * FROM folder_tree;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.notes_with_tags TO authenticated;
GRANT SELECT ON public.folder_hierarchy TO authenticated;
