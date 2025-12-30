-- Add missing profile fields for the profile page
-- This migration adds full_name, phone_e164, and whatsapp_opt_in fields

-- Add the new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_e164 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE;

-- Update existing records to populate full_name from first_name and last_name
UPDATE public.profiles 
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL;

-- Update existing records to populate phone_e164 from phone if it exists
UPDATE public.profiles 
SET phone_e164 = phone
WHERE phone_e164 IS NULL AND phone IS NOT NULL;

-- Add constraint to ensure phone_e164 follows E.164 format if provided
ALTER TABLE public.profiles 
ADD CONSTRAINT check_phone_e164_format 
CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{1,14}$');

-- Create index for phone_e164 lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_e164 ON public.profiles(phone_e164);

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, full_name, phone_e164, whatsapp_opt_in)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 
                 TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || 
                      COALESCE(NEW.raw_user_meta_data->>'last_name', ''))
        ),
        COALESCE(NEW.raw_user_meta_data->>'phone_e164', NULL),
        COALESCE((NEW.raw_user_meta_data->>'whatsapp_opt_in')::boolean, FALSE)
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;