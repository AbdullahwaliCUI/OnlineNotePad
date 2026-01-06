// Script to create sample notes for testing
// Run with: node create-sample-notes.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.log('❌ Could not read .env.local file');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateNotes() {
  console.log('🔍 Checking existing notes...\n');
  
  // First, let's see what users exist
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.log('❌ Error fetching users:', usersError.message);
    return;
  }
  
  console.log('👥 Found users:', users.users.length);
  
  if (users.users.length === 0) {
    console.log('❌ No users found. Please sign up first.');
    return;
  }
  
  // Get the first user
  const user = users.users[0];
  console.log('👤 Using user:', user.email, '(ID:', user.id, ')');
  
  // Check existing notes for this user
  const { data: existingNotes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id);
    
  if (notesError) {
    console.log('❌ Error fetching notes:', notesError.message);
    return;
  }
  
  console.log('📝 Existing notes:', existingNotes.length);
  
  if (existingNotes.length > 0) {
    console.log('✅ Notes already exist:');
    existingNotes.forEach((note, index) => {
      console.log(`  ${index + 1}. ${note.title} (${note.is_archived ? 'Archived' : 'Active'})`);
    });
    return;
  }
  
  // Create sample notes
  console.log('🚀 Creating sample notes...\n');
  
  const sampleNotes = [
    {
      user_id: user.id,
      title: 'Welcome to NotepadX',
      content: 'This is your first note! You can edit, share, and organize your thoughts here.',
      content_html: '<p>This is your first note! You can edit, share, and organize your thoughts here.</p>',
      excerpt: 'This is your first note! You can edit, share, and organize your thoughts here.',
      is_public: false,
      is_shared: false,
      is_archived: false,
      is_pinned: true,
      word_count: 15,
      reading_time: 1
    },
    {
      user_id: user.id,
      title: 'Meeting Notes',
      content: 'Important points from today\'s meeting:\n- Project deadline: Next Friday\n- Budget approved\n- Team assignments updated',
      content_html: '<p>Important points from today\'s meeting:</p><ul><li>Project deadline: Next Friday</li><li>Budget approved</li><li>Team assignments updated</li></ul>',
      excerpt: 'Important points from today\'s meeting: Project deadline, budget, assignments',
      is_public: false,
      is_shared: false,
      is_archived: false,
      is_pinned: false,
      word_count: 18,
      reading_time: 1
    },
    {
      user_id: user.id,
      title: 'Ideas for App Features',
      content: 'New feature ideas:\n1. Dark mode toggle\n2. Export to PDF\n3. Collaboration tools\n4. Voice notes\n5. Tags and categories',
      content_html: '<p>New feature ideas:</p><ol><li>Dark mode toggle</li><li>Export to PDF</li><li>Collaboration tools</li><li>Voice notes</li><li>Tags and categories</li></ol>',
      excerpt: 'New feature ideas: Dark mode, PDF export, collaboration, voice notes, tags',
      is_public: false,
      is_shared: false,
      is_archived: false,
      is_pinned: false,
      word_count: 22,
      reading_time: 1
    }
  ];
  
  for (const note of sampleNotes) {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();
      
    if (error) {
      console.log('❌ Error creating note:', note.title, '-', error.message);
    } else {
      console.log('✅ Created note:', note.title);
    }
  }
  
  console.log('\n🎉 Sample notes created successfully!');
  console.log('🔄 Refresh your dashboard to see the notes.');
}

checkAndCreateNotes().catch(console.error);