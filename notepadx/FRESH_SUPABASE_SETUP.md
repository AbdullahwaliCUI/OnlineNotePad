# 🆕 Fresh Supabase Project Setup

## Step-by-Step Fresh Setup

### 1. Create New Supabase Project
- Go to: https://supabase.com/dashboard
- Click **"New Project"**
- Name: `notepadx-fresh`
- Strong database password
- Select closest region
- Wait 2-3 minutes for creation

### 2. Get New Credentials
**Settings → API:**
- Copy **Project URL**
- Copy **anon public** key

### 3. Database Setup
**SQL Editor → New Query:**
```sql
-- Fresh Database Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_e164 TEXT,
    whatsapp_opt_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notes (
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shared notes" ON public.notes
    FOR SELECT USING (is_shared = true);

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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Fresh database setup completed!' as message;
```

### 4. Authentication Settings
**Authentication → Sign In / Providers:**
- ✅ Allow new users to sign up - ON
- ❌ Confirm email - OFF
- Save changes

### 5. Update Environment Variables
**Local (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
NEXT_PUBLIC_APP_NAME=NotepadX
```

**Vercel Dashboard:**
- Delete old Supabase variables
- Add new variables with fresh credentials
- Redeploy

### 6. Test
- Local: npm run dev
- Live: Test signup on Vercel URL

## Benefits of Fresh Setup
✅ No conflicting policies
✅ Clean database schema
✅ Proper authentication settings
✅ No legacy issues
✅ Fresh start with working configuration