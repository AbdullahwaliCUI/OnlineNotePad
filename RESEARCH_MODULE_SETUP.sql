-- =============================================
-- RESEARCH MODULE DATABASE SETUP
-- Run this script in your Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. RESEARCH PROJECTS (Ensure it exists)
-- =============================================
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. RESEARCH NOTES
-- =============================================
CREATE TABLE IF NOT EXISTS public.research_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. RESEARCH LITERATURE
-- =============================================
CREATE TABLE IF NOT EXISTS public.research_literature (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT,
    url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. RESEARCH EXPERIMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.research_experiments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'failed')),
    results TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. RESEARCH SECTIONS (Paper Mapping)
-- =============================================
CREATE TABLE IF NOT EXISTS public.research_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. RESEARCH REMINDERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.research_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_literature ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reminders ENABLE ROW LEVEL SECURITY;

-- Note: We use IF NOT EXISTS above, but for policies we'll use a DO block to avoid errors if they already exist
DO $$
BEGIN
    -- Projects
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own projects') THEN
        CREATE POLICY "Users can view own projects" ON public.research_projects FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own projects') THEN
        CREATE POLICY "Users can manage own projects" ON public.research_projects FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Notes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own research notes') THEN
        CREATE POLICY "Users can view own research notes" ON public.research_notes FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own research notes') THEN
        CREATE POLICY "Users can manage own research notes" ON public.research_notes FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Literature
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own literature') THEN
        CREATE POLICY "Users can view own literature" ON public.research_literature FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own literature') THEN
        CREATE POLICY "Users can manage own literature" ON public.research_literature FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Experiments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own experiments') THEN
        CREATE POLICY "Users can view own experiments" ON public.research_experiments FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own experiments') THEN
        CREATE POLICY "Users can manage own experiments" ON public.research_experiments FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Sections
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own sections') THEN
        CREATE POLICY "Users can view own sections" ON public.research_sections FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own sections') THEN
        CREATE POLICY "Users can manage own sections" ON public.research_sections FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Reminders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own reminders') THEN
        CREATE POLICY "Users can view own reminders" ON public.research_reminders FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own reminders') THEN
        CREATE POLICY "Users can manage own reminders" ON public.research_reminders FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
