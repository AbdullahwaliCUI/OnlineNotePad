@echo off
echo Redeploying NotepadX to Vercel...
echo.

echo Step 1: Installing dependencies...
npm install --legacy-peer-deps

echo.
echo Step 2: Building the project...
npm run build

echo.
echo Step 3: Deploying to Vercel...
npx vercel --prod

echo.
echo Deployment complete!
pause