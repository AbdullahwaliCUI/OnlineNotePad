import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/callback',
        '/test-db',
        '/test-editor',
        '/s/*', // Private shared notes
      ],
    },
    sitemap: 'https://notepadx.vercel.app/sitemap.xml',
  }
}