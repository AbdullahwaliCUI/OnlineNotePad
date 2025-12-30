# NotepadX

A modern note-taking application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Modern Stack**: Next.js 14 with App Router and TypeScript
- **Clean Design**: Tailwind CSS with responsive layout
- **Authentication**: Supabase Auth with session management
- **Rich Text Editing**: React Quill with HTML sanitization
- **Form Validation**: Zod schemas with TypeScript integration
- **Phone Number Support**: International phone number validation and formatting
- **Toast Notifications**: React Hot Toast for user feedback

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Validation**: Zod
- **Rich Text Editor**: React Quill
- **Phone Input**: react-phone-number-input + libphonenumber-js
- **HTML Sanitization**: DOMPurify
- **Notifications**: React Hot Toast
- **Font**: Inter (Google Fonts)

## Getting Started

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase database:**
   
   Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
   - Create a Supabase project
   - Run the database schema
   - Configure authentication
   
   Or quick setup:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_NAME=NotepadX
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

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
├── components/
│   ├── examples/
│   │   └── ComponentShowcase.tsx # Demo of all UI components
│   ├── providers/
│   │   └── ToastProvider.tsx # Toast notification provider
│   ├── ui/
│   │   ├── RichTextEditor.tsx # React Quill wrapper
│   │   └── PhoneInput.tsx    # Phone number input component
│   └── Navbar.tsx            # Navigation component
├── hooks/
│   └── useAuth.ts            # Authentication hook
├── lib/
│   ├── supabaseClient.ts     # Supabase client configuration
│   ├── database.ts           # Database service layer
│   ├── validations.ts        # Zod validation schemas
│   └── utils.ts              # Utility functions
├── types/
│   └── database.ts           # TypeScript database types
└── supabase/
    └── schema.sql            # Complete database schema
```

## Key Dependencies

- `@supabase/supabase-js` - Supabase client for auth and database
- `zod` - TypeScript-first schema validation
- `react-hot-toast` - Toast notifications
- `react-quill` - Rich text editor (client-side only)
- `dompurify` - HTML sanitization for security
- `react-phone-number-input` + `libphonenumber-js` - Phone number handling

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No (defaults to NotepadX) |

## Next Steps

- ✅ **Database Schema**: Complete SQL schema with all tables, indexes, and security policies
- ✅ **TypeScript Types**: Full type definitions for all database entities
- ✅ **Database Service Layer**: Ready-to-use functions for all CRUD operations
- 🔄 **Authentication Forms**: Implement sign-up, sign-in, and profile management
- 🔄 **Note Management**: Create, edit, delete, and organize notes
- 🔄 **Rich Text Editing**: Integrate the React Quill editor with note saving
- 🔄 **Search & Filtering**: Full-text search and advanced filtering
- 🔄 **Sharing & Collaboration**: Note sharing and public notes
- 🔄 **User Dashboard**: Statistics, recent notes, and quick actions