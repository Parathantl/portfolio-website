import Link from 'next/link';
import { Category, Post } from '@/app/types/blog';
import BlogList from './BlogList';

interface ChildCategoryPageProps {
  category: Category;
  initialPosts?: Post[];
  initialTotal?: number;
  initialPage?: number;
  pageSize?: number;
  authorImage?: string;
}

export default function ChildCategoryPage({
  category,
  initialPosts,
  initialTotal,
  initialPage,
  pageSize,
  authorImage,
}: ChildCategoryPageProps) {
  const master = category.masterCategory;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        {/* Up-navigation: child category -> its master category -> all posts */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm mb-8 text-gray-600 dark:text-gray-400"
        >
          <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">
            Blog
          </Link>
          {master && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                href={`/blog/${master.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {master.name}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {category.title}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          {master && (
            <Link
              href={`/blog/${master.slug}`}
              className="inline-block mb-3 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              ← {master.name}
            </Link>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {category.title}
          </h1>
          {category.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {category.description}
            </p>
          )}
        </div>

        {/* Posts in this child category (route-locked, no extra filters) */}
        <BlogList
          categorySlug={category.slug}
          initialPosts={initialPosts}
          initialTotal={initialTotal}
          initialPage={initialPage}
          pageSize={pageSize}
          authorImage={authorImage}
          showFilters={false}
        />
      </div>
    </div>
  );
}
