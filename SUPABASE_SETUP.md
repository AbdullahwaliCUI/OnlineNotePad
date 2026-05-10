# Supabase Database Setup Guide

This guide will help you set up the complete database schema for NotepadX using Supabase.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `notepadx` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Key** (anon public key)

## Step 3: Configure Environment Variables

1. In your NotepadX project, copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_NAME=NotepadX
   ```

## Step 4: Run the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the script

The script will create:
- All necessary tables (profiles, notes, folders, tags, etc.)
- Indexes for optimal performance
- Row Level Security (RLS) policies
- Triggers for automatic updates
- Views for complex queries
- Functions for common operations

## Step 5: Verify the Setup

After running the schema, you should see the following tables in your **Table Editor**:

### Core Tables
- `profiles` - User profile information
- `notes` - User notes with rich content
- `folders` - Organization folders
- `tags` - Note tags
- `note_tags` - Many-to-many relationship between notes and tags

### Advanced Tables
- `shared_notes` - Note sharing functionality
- `note_versions` - Version history
- `activity_logs` - User activity tracking

### Views
- `notes_with_tags` - Notes with their associated tags
- `folder_hierarchy` - Hierarchical folder structure

## Step 6: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)
3. You should see the NotepadX homepage without any errors
4. The authentication system should be working (though you'll need to implement the sign-up/sign-in forms)

## Step 7: Enable Authentication Providers (Optional)

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Configure the providers you want to use:
   - **Email**: Already enabled by default
   - **Google**: Add your Google OAuth credentials
   - **GitHub**: Add your GitHub OAuth credentials
   - **Other providers**: Configure as needed

## Database Schema Overview

### Key Features

1. **User Profiles**: Extended user information beyond basic auth
2. **Rich Notes**: Support for HTML content with automatic word count and reading time
3. **Organization**: Folders and tags for note organization
4. **Sharing**: Share notes with other users or publicly
5. **Version History**: Track changes to notes over time
6. **Activity Logging**: Monitor user actions for analytics
7. **Full-Text Search**: Search through note titles and content
8. **Security**: Row Level Security ensures users can only access their own data

### Automatic Features

- **Timestamps**: All tables have `created_at` and `updated_at` fields
- **Word Count**: Automatically calculated when notes are saved
- **Reading Time**: Estimated based on word count (200 words/minute)
- **Excerpts**: Auto-generated preview text for notes
- **Activity Logging**: User actions are automatically tracked

## Security

The database uses Row Level Security (RLS) to ensure:
- Users can only access their own data
- Public notes are accessible to everyone
- Shared notes are only accessible to intended recipients
- All operations are properly authenticated

## Performance

The schema includes optimized indexes for:
- User-specific queries
- Full-text search
- Date-based filtering
- Tag and folder relationships

## Troubleshooting

### Common Issues

1. **"Invalid supabaseUrl" Error**
   - Make sure your `.env.local` file has the correct Supabase URL
   - Ensure the URL starts with `https://`

2. **Authentication Not Working**
   - Verify your anon key is correct
   - Check that RLS policies are enabled
   - Ensure the `handle_new_user()` function is working

3. **Database Connection Issues**
   - Confirm your project is active in Supabase dashboard
   - Check that the database password is correct
   - Verify your project region settings

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review the SQL schema comments for detailed explanations

## Next Steps

After setting up the database:

1. Implement authentication forms (sign up, sign in, sign out)
2. Create note management functionality
3. Add folder and tag management
4. Implement search and filtering
5. Add sharing capabilities
6. Set up user profiles and settings

The database is now ready to support all NotepadX features!