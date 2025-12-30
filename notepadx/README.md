# NotepadX

A modern note-taking application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Modern Stack**: Next.js 14 with App Router and TypeScript
- **Clean Design**: Tailwind CSS with responsive layout
- **Authentication Ready**: Placeholder auth system with Sign In/Sign Up pages
- **Dashboard**: Protected dashboard area for authenticated users

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page (placeholder)
│   ├── signin/
│   │   └── page.tsx          # Sign in page (placeholder)
│   ├── signup/
│   │   └── page.tsx          # Sign up page (placeholder)
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.tsx            # Root layout with Navbar
│   └── page.tsx              # Home page
└── components/
    └── Navbar.tsx            # Navigation component
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)

## Next Steps

- Implement authentication system
- Add note creation and editing functionality
- Set up database integration
- Add search and organization features