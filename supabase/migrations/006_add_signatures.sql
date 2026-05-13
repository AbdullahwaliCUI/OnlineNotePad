-- Migration 006: Add Signatures Schema

-- 1. Create user_signatures table
CREATE TABLE IF NOT EXISTS public.user_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    signature_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.user_signatures ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies for user_signatures
CREATE POLICY "Users can view their own signatures" 
ON public.user_signatures FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signatures" 
ON public.user_signatures FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures" 
ON public.user_signatures FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signatures" 
ON public.user_signatures FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
