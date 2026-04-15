import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://parathan.com';

export default function robots(): MetadataRoute.Robots {
  const disallowPaths = [
    '/admin/',
    '/add-post',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/api/',
  ];

  return {
    rules: [
      // Default: allow everything except admin/auth
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowPaths,
      },
      // Explicitly allow AI crawlers (some block by default without explicit allow)
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Amazonbot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: disallowPaths,
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`],
    host: SITE_URL,
  };
}
