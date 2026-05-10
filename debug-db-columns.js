
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkColumns() {
    let supabaseUrl, supabaseKey;
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const lines = envContent.split('\n');
        for (const line of lines) {
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
        }
    } catch (e) {
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking columns...");
    // Try selecting specific columns. If they don't exist, Supabase will return error.
    const { error: err1 } = await supabase.from('profiles').select('first_name').limit(1);
    if (err1) console.log("Check 1 (first_name): FAILED", err1.message);
    else console.log("Check 1 (first_name): OK");

    const { error: err2 } = await supabase.from('profiles').select('last_name').limit(1);
    if (err2) console.log("Check 2 (last_name): FAILED", err2.message);
    else console.log("Check 2 (last_name): OK");

    const { error: err3 } = await supabase.from('profiles').select('full_name').limit(1);
    if (err3) console.log("Check 3 (full_name): FAILED (Expected if correctly set up)", err3.message);
    else console.log("Check 3 (full_name): EXISTS (This indicates OLD schema!)");
}

checkColumns();
