import { Metadata } from 'next';
import BlogList from '../components/blog/BlogList';
import { serverFetch } from '@/app/lib/server-api';
import { getBreadcrumbSchema, SITE_URL } from '../lib/structured-data';
import { Post, Category } from '@/app/types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles, tutorials, and insights across all topics.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog',
    description: 'Articles, tutorials, and insights across all topics.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

async function getPosts(): Promise<Post[]> {
  try {
    return await serverFetch<Post[]>('/post', { revalidate: 3600 });
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    return await serverFetch<Category[]>('/categories', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Blog
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Articles, tutorials, and insights
            </p>
          </div>

          <BlogList initialPosts={posts} initialCategories={categories} />
        </div>
      </div>
    </>
  );
}
