@echo off
echo ========================================
echo Fixing Vercel Environment Variables
echo ========================================

echo.
echo Step 1: Setting Supabase URL...
vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo https://jssqcylbtlccwfauttnr.supabase.co

echo.
echo Step 2: Setting Supabase Anon Key...
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzc3FjeWxidGxjY3dmYXV0dG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODgyMTIsImV4cCI6MjA4MjY2NDIxMn0.n3rJpMHsi6w5K5O543V6SozLlgYCcKWeCtu7eURLZTw

echo.
echo Step 3: Setting App Name...
vercel env add NEXT_PUBLIC_APP_NAME production
echo NotepadX

echo.
echo Step 4: Redeploying...
vercel --prod

echo.
echo ========================================
echo Environment variables updated!
echo Your app should now work properly.
echo ========================================
pause