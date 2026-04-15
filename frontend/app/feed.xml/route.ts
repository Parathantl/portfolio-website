import { Post } from '@/app/types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://parathan.com';

const getApiUrl = () => {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3001';
  return `${SITE_URL}/api`;
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function GET() {
  const API_URL = getApiUrl();

  let posts: Post[] = [];
  try {
    const response = await fetch(`${API_URL}/post`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      posts = await response.json();
    }
  } catch (error) {
    console.error('[RSS] Error fetching posts:', error);
  }

  // Fetch about info for dynamic author name
  let authorName = 'Blog Author';
  let siteDescription = 'Blog articles and insights';
  try {
    const aboutRes = await fetch(`${API_URL}/portfolio/about`, {
      next: { revalidate: 86400 },
    });
    if (aboutRes.ok) {
      const about = await aboutRes.json();
      if (about.fullName) authorName = about.fullName;
      if (about.tagline) siteDescription = about.tagline;
    }
  } catch { /* ignore */ }

  const items = posts
    .slice(0, 50)
    .map((post) => {
      const textContent = stripHTML(post.content || '');
      const description =
        post.excerpt || textContent.substring(0, 300) + '...';
      const pubDate = new Date(
        post.createdAt || post.createdOn || ''
      ).toUTCString();
      const categories = (post.categories || [])
        .map((c) => `      <category>${escapeXml(c.title)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
${categories}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(authorName)} - Blog</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(siteDescription)}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
