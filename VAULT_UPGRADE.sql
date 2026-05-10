-- =============================================
-- VAULT DATABASE UPGRADE SCRIPT
-- Run this script to add support for multiple entries per item
-- =============================================

-- 1. Add new columns
ALTER TABLE public.vault_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'Password',
ADD COLUMN IF NOT EXISTS entries JSONB DEFAULT '[]'::jsonb;

-- 2. Migrate existing data into the new JSONB structure
-- This safely moves the old username/password/url fields into the entries array
UPDATE public.vault_items
SET entries = jsonb_build_array(
    jsonb_build_object(
        'id', id,
        'productName', COALESCE(username, 'Default Entry'),
        'password', COALESCE(password, ''),
        'url', COALESCE(url, ''),
        'note', ''
    )
)
WHERE jsonb_array_length(entries) = 0 AND (username IS NOT NULL OR password IS NOT NULL OR url IS NOT NULL);

-- (Optional) If you want to drop the old columns to keep the database clean, uncomment these:
-- ALTER TABLE public.vault_items DROP COLUMN username;
-- ALTER TABLE public.vault_items DROP COLUMN password;
-- ALTER TABLE public.vault_items DROP COLUMN url;
