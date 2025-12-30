// Environment configuration and validation
export const env = {
  // App configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'NotepadX',
  
  // Supabase configuration (required)
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Google Translate API (optional)
  GOOGLE_TRANSLATE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '',
  
  // Environment detection
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Vercel specific
  VERCEL_URL: process.env.VERCEL_URL || '',
  VERCEL_ENV: process.env.VERCEL_ENV || '',
} as const;

// Validation function
export function validateEnvironment() {
  const errors: string[] = [];
  
  // Required environment variables
  if (!env.SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!env.SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  // Validate Supabase URL format
  if (env.SUPABASE_URL && !env.SUPABASE_URL.includes('supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL');
  }
  
  // Validate Supabase key format
  if (env.SUPABASE_ANON_KEY && !env.SUPABASE_ANON_KEY.startsWith('eyJ')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY must be a valid JWT token');
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (env.IS_PRODUCTION) {
      throw new Error('Environment validation failed in production');
    }
  } else {
    console.log('✅ Environment validation passed');
  }
  
  return errors.length === 0;
}

// Get base URL for the application
export function getBaseUrl(): string {
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  
  if (env.IS_PRODUCTION) {
    return 'https://notepadx.vercel.app'; // Replace with your domain
  }
  
  return 'http://localhost:3000';
}

// Feature flags based on environment
export const features = {
  // Voice input requires HTTPS (available in production)
  voiceInput: env.IS_PRODUCTION || env.VERCEL_URL !== '',
  
  // Translation available if API key is set or using free service
  translation: true, // MyMemory is always available
  
  // Analytics (add your analytics ID)
  analytics: env.IS_PRODUCTION,
  
  // Debug mode
  debug: env.IS_DEVELOPMENT,
} as const;

// Log environment info (development only)
if (env.IS_DEVELOPMENT) {
  console.log('🔧 Environment Info:', {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    GOOGLE_TRANSLATE_API_KEY: env.GOOGLE_TRANSLATE_API_KEY ? '✅ Set' : '⚠️ Optional',
    VERCEL_URL: env.VERCEL_URL || 'Not deployed',
    features,
  });
}