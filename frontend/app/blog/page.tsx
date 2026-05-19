import { Metadata } from 'next';
import BlogList from '../components/blog/BlogList';
import { serverFetch } from '@/app/lib/server-api';
import { getBreadcrumbSchema, SITE_URL } from '../lib/structured-data';
import { PaginatedPosts, MasterCategory } from '@/app/types/blog';

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

const PAGE_SIZE = 9;

async function getInitialPosts(): Promise<PaginatedPosts> {
  try {
    return await serverFetch<PaginatedPosts>(
      `/post?page=1&limit=${PAGE_SIZE}`,
      { revalidate: 3600 },
    );
  } catch {
    return { items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };
  }
}

async function getMasterCategories(): Promise<MasterCategory[]> {
  try {
    return await serverFetch<MasterCategory[]>('/master-categories', {
      revalidate: 3600,
    });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const [initial, masterCategories] = await Promise.all([
    getInitialPosts(),
    getMasterCategories(),
  ]);

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

          <BlogList
            initialPosts={initial.items}
            initialTotal={initial.total}
            initialPage={initial.page}
            pageSize={initial.limit}
            initialMasterCategories={masterCategories}
          />
        </div>
      </div>
    </>
  );
}
