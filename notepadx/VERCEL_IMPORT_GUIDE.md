# 📥 Vercel Environment Variables Import Guide

## 🎯 Files Ready for Import

Main ne aapke liye 2 files banai hain:

### 1. JSON Format (Recommended)
**File:** `vercel-import-env.json`
- Vercel dashboard mein direct import kar sakte hain
- All environments (production, preview, development) ke liye set ho jayegi

### 2. Simple Text Format  
**File:** `vercel-env-simple.txt`
- Copy-paste ke liye simple format
- Manual entry ke liye use kar sakte hain

## 🚀 Import Steps

### Method 1: JSON Import (Easy)
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click **"Import"** button (top right)
3. Upload `vercel-import-env.json` file
4. Click **"Import"** to confirm
5. Redeploy your project

### Method 2: Manual Copy-Paste
1. Open `vercel-env-simple.txt`
2. Copy each line
3. Vercel Dashboard → Settings → Environment Variables
4. Click **"Add New"** for each variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jssqcylbtlccwfauttnr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_APP_NAME` | `NotepadX` |

5. Select **All Environments** (Production, Preview, Development)
6. Save each variable

## ⚠️ Important Notes

1. **Delete old variables first** - Remove any existing SUPABASE variables with wrong format
2. **Select all environments** - Production, Preview, Development
3. **Redeploy after import** - Go to Deployments → Redeploy latest

## ✅ After Import

1. Redeploy your project
2. Test signup at your live URL
3. Should work without "Supabase not configured" error

## 🎉 Ready Files

- ✅ `vercel-import-env.json` - For direct import
- ✅ `vercel-env-simple.txt` - For manual copy-paste
- ✅ Both have correct formatting
- ✅ All environments included