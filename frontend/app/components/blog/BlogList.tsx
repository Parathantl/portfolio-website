'use client';

import { useEffect, useState } from 'react';
import BlogCard from './BlogCard';
import { blogAPI } from '@/app/lib/api';
import { Post, Category } from '@/app/types/blog';

interface BlogListProps {
  masterCategorySlug?: string; // 'tech', 'tamil', or undefined for all
  limit?: number;
  initialPosts?: Post[];
  initialCategories?: Category[];
}

export default function BlogList({ masterCategorySlug, limit, initialPosts, initialCategories }: BlogListProps) {
  const hasInitialPosts = initialPosts && initialPosts.length > 0;
  const hasInitialCategories = initialCategories && initialCategories.length > 0;
  const [posts, setPosts] = useState<Post[]>(hasInitialPosts ? initialPosts : []);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(hasInitialPosts ? initialPosts : []);
  const [loading, setLoading] = useState(!hasInitialPosts);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>(hasInitialCategories ? initialCategories : []);

  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) return; // Skip fetch only if server provided actual data

    const fetchData = async () => {
      try {
        setLoading(true);

        // Build query params for filtering
        const queryParams: any = {};
        if (masterCategorySlug) {
          queryParams.masterCategory = masterCategorySlug;
        }

        // Fetch posts with master category filter
        const postsData = await blogAPI.getPosts(queryParams);

        // Fetch categories (skip if server already provided them)
        if (!hasInitialCategories) {
          const categoriesData = await blogAPI.getCategories();
          setCategories(categoriesData);
        }

        // Ensure postsData is an array
        const postsArray = Array.isArray(postsData) ? postsData : [];

        // Apply limit if specified
        const postsToShow = limit ? postsArray.slice(0, limit) : postsArray;

        setPosts(postsToShow);
        setFilteredPosts(postsToShow);
      } catch (err) {
        setError('Failed to load blog posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [masterCategorySlug, limit, initialPosts, hasInitialCategories]);

  // Handle search and category filter
  useEffect(() => {
    let filtered = posts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((post) =>
        post.categories?.some(cat => cat.id === parseInt(selectedCategory))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory, posts]);

  // Filter categories for dropdown (only show categories from current master category)
  const availableCategories = masterCategorySlug
    ? categories.filter(cat => cat.masterCategory?.slug === masterCategorySlug)
    : categories;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      {!masterCategorySlug && (
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || selectedCategory !== 'all'
              ? 'No posts found matching your criteria.'
              : 'No blog posts available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Results Count */}
      {(searchQuery || selectedCategory !== 'all') && filteredPosts.length > 0 && (
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      )}
    </div>
  );
}
