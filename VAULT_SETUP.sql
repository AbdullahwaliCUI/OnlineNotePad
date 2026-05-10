-- =============================================
-- SECURE VAULT DATABASE SETUP
-- Run this script to create the Password & URL Manager tables
-- =============================================

-- =============================================
-- VAULT CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.vault_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- =============================================
-- VAULT ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.vault_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.vault_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    username TEXT,
    password TEXT,
    url TEXT,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.vault_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

-- Policies for Vault Categories
CREATE POLICY "Users can manage own vault categories" ON public.vault_categories FOR ALL USING (auth.uid() = user_id);

-- Policies for Vault Items
CREATE POLICY "Users can manage own vault items" ON public.vault_items FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- OPTIONAL: Insert Default Category for existing users
-- =============================================
-- INSERT INTO public.vault_categories (user_id, name, icon)
-- SELECT id, 'Personal', 'user' FROM public.profiles
-- ON CONFLICT DO NOTHING;
