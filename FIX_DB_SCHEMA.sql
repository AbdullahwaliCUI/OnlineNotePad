-- =============================================
-- FIX PROFILES SCHEMA INTERFACE
-- Run this script to fix the 'Database error saving new user'
-- =============================================

-- 1. Add missing columns expected by the trigger
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';

-- 2. Make them nullable for now to avoid issues with existing data, 
-- or update them if you want.
UPDATE public.profiles SET first_name = '' WHERE first_name IS NULL;
UPDATE public.profiles SET last_name = '' WHERE last_name IS NULL;

-- 3. Make 'full_name' nullable (if it exists) because the new trigger DOES NOT provide it.
-- If full_name is NOT NULL, the insert will fail.
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name') THEN
        ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
    END IF;
END $$;

-- 4. Re-apply the trigger just in case
-- (The definition below matches the one expected by the app)
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
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;
