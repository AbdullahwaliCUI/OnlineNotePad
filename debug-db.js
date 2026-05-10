
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkSchema() {
    let supabaseUrl, supabaseKey;

    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const lines = envContent.split('\n');
        for (const line of lines) {
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
        }
    } catch (e) {
        console.error('Error reading .env.local');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // We can't query information_schema.columns directly with anon key usually due to permissions,
    // BUT we can try to insert a dummy row or select from it to see error, 
    // OR we can rely on the user running the SQL script I gave them.

    // Actually, better play: Try to fetch one profile to see if it works at all.
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.log('Error accessing profiles table:', error);
    } else {
        console.log('Profiles table is accessible. Data:', data);
    }
}

checkSchema();
