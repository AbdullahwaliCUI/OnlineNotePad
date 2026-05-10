// Simple Supabase connection test
// Run with: node test-supabase.js

const fs = require('fs');
const path = require('path');

// Read .env.local file manually
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
}

console.log('🔍 Testing Supabase Configuration...\n');

console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (supabaseUrl) {
  console.log('URL Format:', supabaseUrl.startsWith('https://') ? '✅ Valid' : '❌ Invalid');
  console.log('URL Value:', supabaseUrl);
}

if (supabaseKey) {
  console.log('Key Format:', supabaseKey.startsWith('eyJ') ? '✅ Valid JWT' : '❌ Invalid JWT');
  console.log('Key Length:', supabaseKey.length, 'characters');
}

console.log('\n🧪 Testing Connection...');

// Test basic connection
if (supabaseUrl && supabaseKey) {
  fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      console.log('Status:', response.status);
    } else {
      console.log('❌ Supabase connection failed');
      console.log('Status:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ Connection error:', error.message);
  });
} else {
  console.log('❌ Cannot test connection - missing credentials');
}

console.log('\n📋 Next Steps:');
console.log('1. If local test passes, update Vercel environment variables');
console.log('2. Redeploy your Vercel app');
console.log('3. Test signup on live site');