-- =============================================
-- SAFE SUPABASE SETUP (NO ERRORS IF EXISTS)
-- =============================================

-- Enable extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CREATE TABLES (ONLY IF NOT EXISTS)
-- =============================================

-- Profiles table (safe)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_e164 TEXT,
    whatsapp_opt_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table (safe)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    content_html TEXT NOT NULL DEFAULT '',
    is_shared BOOLEAN DEFAULT FALSE,
    share_id UUID DEFAULT uuid_generate_v4(),
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENABLE RLS (SAFE)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES (SAFE)
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can view shared notes" ON public.notes;

-- =============================================
-- CREATE POLICIES (FRESH)
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Notes policies
CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Public notes policy (for sharing)
CREATE POLICY "Anyone can view shared notes" ON public.notes
    FOR SELECT USING (is_shared = true);

-- =============================================
-- FUNCTIONS (SAFE REPLACE)
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS (SAFE REPLACE)
-- =============================================

-- Drop existing triggers (safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_notes ON public.notes;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_notes
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- INDEXES (SAFE)
-- =============================================

-- Drop existing indexes (safe)
DROP INDEX IF EXISTS idx_notes_user_id;
DROP INDEX IF EXISTS idx_notes_share_id;
DROP INDEX IF EXISTS idx_notes_created_at;
DROP INDEX IF EXISTS idx_notes_is_shared;
DROP INDEX IF EXISTS idx_profiles_email;

-- Create indexes
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_share_id ON public.notes(share_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX idx_notes_is_shared ON public.notes(is_shared) WHERE is_shared = true;
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Database setup completed successfully!' as message;