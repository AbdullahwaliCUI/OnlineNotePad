-- Migration: 002_add_sharing_fields
-- Description: Add sharing fields to existing notes table
-- Created: 2024-12-30

-- Add sharing fields to notes table
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_id UUID DEFAULT uuid_generate_v4();

-- Create index for share_id lookups
CREATE INDEX IF NOT EXISTS idx_notes_share_id ON public.notes(share_id) WHERE is_shared = TRUE;

-- Update RLS policies to allow public access to shared notes
DROP POLICY IF EXISTS "Users can view shared notes" ON public.notes;
CREATE POLICY "Users can view shared notes" ON public.notes
    FOR SELECT USING (is_shared = TRUE);

-- Migration completed successfully