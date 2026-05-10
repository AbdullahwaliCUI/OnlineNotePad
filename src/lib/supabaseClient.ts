import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl !== 'your_supabase_url_here' &&
                      supabaseAnonKey !== 'your_supabase_anon_key_here' &&
                      (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'));

let supabase: SupabaseClient;

if (hasValidConfig) {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else {
  // Create a mock client for development
  console.warn(
    '⚠️  Supabase environment variables not properly configured. Using mock client for development. Please set up your .env.local file with actual Supabase credentials.'
  );
  
  // Create a minimal mock client that won't cause errors
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    },
  } as any;
}

export { supabase };
export default supabase;