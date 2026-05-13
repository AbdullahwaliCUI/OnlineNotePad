-- Migration 005: Add Comments Schema

-- 1. Create note_comments table
CREATE TABLE IF NOT EXISTS public.note_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create note_comment_replies table
CREATE TABLE IF NOT EXISTS public.note_comment_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES public.note_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_comment_replies ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for note_comments
-- A user can read comments if they can read the note (simplifying to all authenticated users for now)
CREATE POLICY "Users can view all comments" 
ON public.note_comments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can insert comments" 
ON public.note_comments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.note_comments FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their own comments" 
ON public.note_comments FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND user_id = auth.uid()));

-- 5. Create Policies for note_comment_replies
CREATE POLICY "Users can view all replies" 
ON public.note_comment_replies FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can insert replies" 
ON public.note_comment_replies FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON public.note_comment_replies FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
