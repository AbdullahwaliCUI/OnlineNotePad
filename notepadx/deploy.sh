#!/bin/bash

# NotepadX Vercel Deployment Script
# Run this script to deploy your app to Vercel

echo "🚀 NotepadX Vercel Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the notepadx directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: NotepadX with voice translation features"
    echo "✅ Git repository initialized"
else
    echo "📁 Git repository already exists"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Committing latest changes..."
    git add .
    git commit -m "Update: Latest changes before deployment"
    echo "✅ Changes committed"
fi

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Please add your GitHub repository as origin:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/notepadx.git"
    echo "   git push -u origin main"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
echo "✅ Code pushed to GitHub"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo "======================================"
echo "Your NotepadX app is now live!"
echo ""
echo "📋 Next Steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Configure your custom domain (optional)"
echo "3. Test all features on the live site"
echo ""
echo "🔧 Environment Variables Needed:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- NEXT_PUBLIC_APP_NAME (optional)"
echo "- NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY (optional)"
echo ""
echo "📖 Full deployment guide: ./VERCEL_DEPLOYMENT.md"
echo "======================================"