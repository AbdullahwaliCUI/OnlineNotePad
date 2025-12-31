# 🔧 Supabase Configuration Fix Guide

## Problem
Your Vercel deployment shows "Supabase not configured" error when users try to sign up.

## Root Cause
The environment variables in Vercel are incorrectly formatted with duplicate prefixes and extra characters.

## ✅ Solution Steps

### Step 1: Fix Local Environment (Already Done)
Your local `.env.local` file has been fixed with correct values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://jssqcylbtlccwfauttnr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzc3FjeWxidGxjY3dmYXV0dG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODgyMTIsImV4cCI6MjA4MjY2NDIxMn0.n3rJpMHsi6w5K5O543V6SozLlgYCcKWeCtu7eURLZTw
NEXT_PUBLIC_APP_NAME=NotepadX
```

### Step 2: Fix Vercel Environment Variables

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `notepadx` project
3. Go to **Settings** → **Environment Variables**
4. **Delete all existing Supabase variables** (they have wrong format)
5. Add these new variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jssqcylbtlccwfauttnr.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzc3FjeWxidGxjY3dmYXV0dG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODgyMTIsImV4cCI6MjA4MjY2NDIxMn0.n3rJpMHsi6w5K5O543V6SozLlgYCcKWeCtu7eURLZTw` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_NAME` | `NotepadX` | Production, Preview, Development |

#### Option B: Using Vercel CLI
Run the provided script:
```bash
./fix-vercel-env.bat
```

### Step 3: Redeploy
After updating environment variables:
1. Go to **Deployments** tab in Vercel dashboard
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 4: Verify Database Setup
Make sure your Supabase database has the correct schema:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `jssqcylbtlccwfauttnr`
3. Go to **SQL Editor**
4. Run the quick setup script from `supabase-quick-setup.sql`

## 🧪 Testing

### Local Testing (Should Work Now)
```bash
npm run dev
# Visit http://localhost:3000/auth/sign-up
# Try creating an account
```

### Production Testing (After Vercel Fix)
1. Visit your live URL: `https://notepadx-neon.vercel.app`
2. Go to Sign Up page
3. Create a test account
4. Should work without "Supabase not configured" error

## 🔍 Troubleshooting

### If Still Getting Errors:

#### Check Environment Variables Format
In Vercel dashboard, ensure variables look like:
```
NEXT_PUBLIC_SUPABASE_URL = https://jssqcylbtlccwfauttnr.supabase.co
```

NOT like:
```
NEXT_PUBLIC_SUPABASE_URL = "NEXT_PUBLIC_SUPABASE_URL=https://..."
```

#### Check Supabase Project Status
1. Verify your Supabase project is active
2. Check API keys are still valid
3. Ensure database schema is deployed

#### Check Browser Console
1. Open browser dev tools
2. Look for Supabase connection errors
3. Check network requests to Supabase

## 📋 What Was Fixed

1. **Environment Variables**: Removed duplicate prefixes and extra characters
2. **Auth Service**: Fixed profile table field mapping (`full_name` vs `first_name`/`last_name`)
3. **Database Schema**: Ensured compatibility with quick setup schema

## 🚀 Next Steps

After fixing:
1. Test signup/signin functionality
2. Verify note creation works
3. Test all app features
4. Consider setting up email confirmation in Supabase Auth settings

## 📞 Support

If you still have issues:
1. Check the browser console for specific error messages
2. Verify Supabase project credentials
3. Ensure database schema is properly deployed
4. Test with a fresh incognito browser session