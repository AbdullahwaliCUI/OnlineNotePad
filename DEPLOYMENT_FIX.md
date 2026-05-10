# Deployment Fix Guide

## Issue
Getting 404 NOT_FOUND error on Vercel deployment.

## Root Cause
The `output: 'standalone'` configuration in `next.config.js` was causing routing issues on Vercel.

## Fixes Applied

### 1. Updated next.config.js
- Removed `output: 'standalone'` configuration
- This allows Vercel to handle routing properly

### 2. Simplified vercel.json
- Removed conflicting headers and rewrites
- Kept only essential configuration

### 3. Environment Variables
Make sure these are set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_NAME`

## Deployment Steps

### Option 1: Auto Deploy (Recommended)
1. Push changes to your Git repository
2. Vercel will automatically redeploy

### Option 2: Manual Deploy
1. Run `npm run build` to test locally
2. Run `npx vercel --prod` to deploy

### Option 3: Use the redeploy script
1. Run `redeploy.bat` (Windows) or create similar script for other OS

## Verification
After deployment, check:
1. Home page loads correctly
2. Authentication works
3. Dashboard is accessible
4. Notes can be created and edited

## If Still Getting 404
1. Check Vercel dashboard for build logs
2. Verify environment variables are set
3. Check if domain is properly configured
4. Try redeploying from scratch