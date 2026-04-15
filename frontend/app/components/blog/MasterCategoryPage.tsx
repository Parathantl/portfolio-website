'use client';

import { MasterCategory, Post } from '@/app/types/blog';
import BlogList from './BlogList';

interface MasterCategoryPageProps {
  masterCategory: MasterCategory;
  initialPosts?: Post[];
}

export default function MasterCategoryPage({ masterCategory, initialPosts }: MasterCategoryPageProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {masterCategory.name} Blog
          </h1>
          {masterCategory.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {masterCategory.description}
            </p>
          )}
        </div>

        {/* Blog Posts */}
        <BlogList masterCategorySlug={masterCategory.slug} initialPosts={initialPosts} />
      </div>
    </div>
  );
}
