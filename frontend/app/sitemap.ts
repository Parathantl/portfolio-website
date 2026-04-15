import { MetadataRoute } from 'next';
import { Post } from './types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://parathan.com';

const getApiUrl = () => {
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  return `${SITE_URL}/api`;
};

const API_URL = getApiUrl();

interface Project {
  id: number;
  updatedAt?: string;
  createdAt?: string;
}

interface About {
  updatedAt?: string;
}

interface MasterCategoryEntry {
  id: number;
  slug: string;
  isActive: boolean;
  updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch timestamps for more accurate lastModified
  let aboutUpdated: Date = new Date('2024-01-01');
  try {
    const aboutRes = await fetch(`${API_URL}/portfolio/about`, { cache: 'no-store' });
    if (aboutRes.ok) {
      const about: About = await aboutRes.json();
      if (about.updatedAt) aboutUpdated = new Date(about.updatedAt);
    }
  } catch { /* ignore */ }

  // Fetch master categories dynamically for blog category pages
  // Also fetch posts to determine which categories actually have content
  let masterCategoryPages: MetadataRoute.Sitemap = [];
  try {
    const [mcRes, postsRes] = await Promise.all([
      fetch(`${API_URL}/master-categories`, { cache: 'no-store' }),
      fetch(`${API_URL}/post`, { cache: 'no-store' }),
    ]);
    if (mcRes.ok) {
      const masterCategories: MasterCategoryEntry[] = await mcRes.json();
      // Build set of master category slugs that have at least one post
      let categorySlugsWithPosts = new Set<string>();
      if (postsRes.ok) {
        const posts: Post[] = await postsRes.json();
        for (const post of posts) {
          for (const cat of (post.categories || [])) {
            if (cat.masterCategory?.slug) {
              categorySlugsWithPosts.add(cat.masterCategory.slug);
            }
          }
        }
      }
      masterCategoryPages = masterCategories
        .filter((mc) => mc.isActive && categorySlugsWithPosts.has(mc.slug))
        .map((mc) => ({
          url: `${SITE_URL}/blog/${mc.slug}`,
          lastModified: mc.updatedAt ? new Date(mc.updatedAt) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
    }
  } catch { /* ignore */ }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...masterCategoryPages,
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: aboutUpdated,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/portfolio/about`,
      lastModified: aboutUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/portfolio/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/portfolio/skills`,
      lastModified: aboutUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/portfolio/experience`,
      lastModified: aboutUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ];

  // Fetch blog posts
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    console.log(`[Sitemap] Fetching blog posts from: ${API_URL}/post`);
    const postsResponse = await fetch(`${API_URL}/post`, {
      cache: 'no-store',
    });

    if (postsResponse.ok) {
      const posts: Post[] = await postsResponse.json();
      console.log(`[Sitemap] Successfully fetched ${posts.length} blog posts`);
      blogPosts = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } else {
      console.warn(`[Sitemap] Failed to fetch blog posts: HTTP ${postsResponse.status}`);
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching blog posts:', error);
  }

  // Fetch projects
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    console.log(`[Sitemap] Fetching projects from: ${API_URL}/portfolio/projects`);
    const projectsResponse = await fetch(`${API_URL}/portfolio/projects`, {
      cache: 'no-store',
    });

    if (projectsResponse.ok) {
      const projects: Project[] = await projectsResponse.json();
      console.log(`[Sitemap] Successfully fetched ${projects.length} projects`);
      projectPages = projects.map((project) => ({
        url: `${SITE_URL}/portfolio/projects/${project.id}`,
        lastModified: project.updatedAt || project.createdAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    } else {
      console.warn(`[Sitemap] Failed to fetch projects: HTTP ${projectsResponse.status}`);
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching projects:', error);
  }

  const totalUrls = [...staticPages, ...blogPosts, ...projectPages];
  console.log(`[Sitemap] Generated sitemap with ${totalUrls.length} URLs (${staticPages.length} static, ${blogPosts.length} posts, ${projectPages.length} projects)`);

  return totalUrls;
}
