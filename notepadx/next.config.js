/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better Vercel compatibility
  output: 'standalone',

  // Optimize images
  images: {
    domains: [],
    unoptimized: true
  },

  // Enable experimental features
  // Enable experimental features
  experimental: {
  },

  // Environment variables are handled automatically by Next.js
  // when prefixed with NEXT_PUBLIC_

  // Webpack configuration for better compatibility
  // Webpack configuration for better compatibility
  /*
  webpack: (config, { isServer }) => {
    // Handle client-side modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  */

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'microphone=*, camera=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;