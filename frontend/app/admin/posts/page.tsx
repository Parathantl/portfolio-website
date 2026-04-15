'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { blogAPI } from '@/app/lib/api';
import { Post, MasterCategory } from '@/app/types/blog';

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPosts();
    fetchMasterCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await blogAPI.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterCategories = async () => {
    try {
      const data = await blogAPI.getMasterCategories();
      setMasterCategories(data);
    } catch (error) {
      console.error('Error fetching master categories:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogAPI.deletePost(id);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryBadgeColor = (masterCategoryName?: string) => {
    switch (masterCategoryName?.toLowerCase()) {
      case 'tamil':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'tech':
      case 'technical':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;

    // Check if post has any category from the selected master category
    return post.categories?.some(
      cat => cat.masterCategory?.slug === filter || cat.masterCategoryId.toString() === filter
    );
  });

  // Count posts per master category
  const countPostsForMasterCategory = (masterCategorySlug: string) => {
    return posts.filter(post =>
      post.categories?.some(cat => cat.masterCategory?.slug === masterCategorySlug)
    ).length;
  };

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Blog Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all your blog posts across different categories
          </p>
        </div>
        <Link
          href="/admin/posts/add"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-center sm:self-start"
        >
          + Write Post
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Posts ({posts.length})
        </button>
        {masterCategories.map((mc) => (
          <button
            key={mc.id}
            onClick={() => setFilter(mc.slug)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === mc.slug
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {mc.name} ({countPostsForMasterCategory(mc.slug)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-64"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter !== 'all'
              ? `No posts in ${masterCategories.find(mc => mc.slug === filter)?.name || 'this category'} yet.`
              : 'No posts yet. Write your first post to get started!'}
          </p>
          <Link
            href="/admin/posts/add"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Write Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts
            .sort((a, b) => new Date(b.createdOn || b.createdAt).getTime() - new Date(a.createdOn || a.createdAt).getTime())
            .map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Post Image */}
                  {post.mainImageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={post.mainImageUrl}
                        alt={post.title}
                        className="w-full md:w-48 h-48 md:h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {post.title}
                          </h3>
                          {/* Multiple Category Badges */}
                          <div className="flex flex-wrap gap-2">
                            {post.categories?.map((category) => (
                              <span
                                key={category.id}
                                className={`px-3 py-1 text-xs rounded-full ${getCategoryBadgeColor(category.masterCategory?.name)}`}
                              >
                                {category.title}
                              </span>
                            ))}
                          </div>
                        </div>
                        {post.excerpt && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>By {post.user ? `${post.user.firstname} ${post.user.lastname}` : 'Author'}</span>
                          <span>•</span>
                          <span>{formatDate(post.createdOn || post.createdAt)}</span>
                          {(post.modifiedOn || post.updatedAt) !== (post.createdOn || post.createdAt) && (
                            <>
                              <span>•</span>
                              <span>Updated {formatDate(post.modifiedOn || post.updatedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-center"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
