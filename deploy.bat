@echo off
echo 🚀 NotepadX Vercel Deployment Script
echo ======================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the notepadx directory.
    pause
    exit /b 1
)

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: NotepadX with voice translation features"
    echo ✅ Git repository initialized
) else (
    echo 📁 Git repository already exists
)

REM Commit any changes
echo 📝 Committing latest changes...
git add .
git commit -m "Update: Latest changes before deployment"
echo ✅ Changes committed

REM Install Vercel CLI if not present
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
    echo ✅ Vercel CLI installed
)

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main
echo ✅ Code pushed to GitHub

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo 🎉 Deployment Complete!
echo ======================================
echo Your NotepadX app is now live!
echo.
echo 📋 Next Steps:
echo 1. Add environment variables in Vercel dashboard
echo 2. Configure your custom domain (optional)
echo 3. Test all features on the live site
echo.
echo 🔧 Environment Variables Needed:
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo - NEXT_PUBLIC_APP_NAME (optional)
echo - NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY (optional)
echo.
echo 📖 Full deployment guide: ./VERCEL_DEPLOYMENT.md
echo ======================================
pause