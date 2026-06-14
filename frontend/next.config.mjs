// Content Security Policy, shipped in Report-Only so it can never break the
// site. Load the blog, portfolio, a post with embeds, and /admin, then watch
// the browser console for violations; once clean, switch the header key below
// to 'Content-Security-Policy' to enforce. Notes:
//   - 'unsafe-inline' on script-src is required by Next.js hydration + the
//     inline JSON-LD blocks (no nonce middleware in place).
//   - next/font self-hosts Inter, so no Google Fonts origins are needed.
//   - img-src allows https: so Cloudinary/markdown-embedded images work.
//   - if the admin Markdown editor reports an eval violation, add 'unsafe-eval'.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

// X-Frame-Options / X-Content-Type-Options are set at the nginx edge; these are
// the headers that ship with the app so a deploy can't forget them.
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable for Docker builds
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: 'backend', // Docker network hostname
        port: '3001',
      },
    ],
  },
  async headers() {
    return [
      {
        // Security headers on every route (HSTS/CSP-Report-Only/Referrer).
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/blog/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/portfolio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/feed.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
