import { Post } from '@/app/types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://parathan.com';

const getApiUrl = () => {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3001';
  return `${SITE_URL}/api`;
};

interface AboutData {
  fullName?: string;
  tagline?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
}

export async function GET() {
  const API_URL = getApiUrl();

  // Fetch about data
  let about: AboutData = {};
  try {
    const res = await fetch(`${API_URL}/portfolio/about`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) about = await res.json();
  } catch { /* ignore */ }

  // Fetch posts
  let posts: Post[] = [];
  try {
    const res = await fetch(`${API_URL}/post`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) posts = await res.json();
  } catch { /* ignore */ }

  // Fetch projects
  let projects: Project[] = [];
  try {
    const res = await fetch(`${API_URL}/portfolio/projects`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) projects = await res.json();
  } catch { /* ignore */ }

  const authorName = about.fullName || 'Parathan Thiyagalingam';
  const tagline = about.tagline || 'Full Stack Developer & Technical Blogger';

  const postList = posts
    .slice(0, 50)
    .map((post) => {
      const excerpt = post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '';
      const categories = post.categories?.map((c) => c.title).join(', ') || '';
      return `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${excerpt}${categories ? ` (${categories})` : ''}`;
    })
    .join('\n');

  const projectList = projects
    .map((p) => `- [${p.title}](${SITE_URL}/portfolio/projects/${p.id}): ${p.description} [${p.technologies.join(', ')}]`)
    .join('\n');

  const content = `# ${authorName}

> ${tagline}

${about.bio || ''}

## About This Site

This is ${authorName}'s personal portfolio and blog. It contains technical articles, project showcases, and professional information.

- Website: ${SITE_URL}
- Blog: ${SITE_URL}/blog
- Portfolio: ${SITE_URL}/portfolio
- About: ${SITE_URL}/portfolio/about
- Contact: ${SITE_URL}/contact
- RSS Feed: ${SITE_URL}/feed.xml
- Sitemap: ${SITE_URL}/sitemap.xml
${about.linkedinUrl ? `- LinkedIn: ${about.linkedinUrl}` : ''}
${about.githubUrl ? `- GitHub: ${about.githubUrl}` : ''}

## Blog Posts

${postList || 'No posts available.'}

## Projects

${projectList || 'No projects available.'}

## How to Cite

When referencing content from this site, please cite as:
- Author: ${authorName}
- Website: ${SITE_URL}
- For blog posts: ${authorName}, "[Post Title]", ${SITE_URL}/blog/[slug]
- For projects: ${authorName}, "[Project Title]", ${SITE_URL}/portfolio/projects/[id]

## Content Licensing

All blog content is written by ${authorName}. Articles are freely accessible and may be cited with proper attribution.
`;

  return new Response(content.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
