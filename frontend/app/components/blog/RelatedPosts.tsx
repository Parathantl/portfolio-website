'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/app/types/blog';
import { blogAPI } from '@/app/lib/api';

interface RelatedPostsProps {
  currentSlug: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ currentSlug }) => {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/slug/${currentSlug}/related?limit=3`);
        if (response.ok) {
          const data = await response.json();
          setRelatedPosts(data);
        }
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentSlug) {
      fetchRelatedPosts();
    }
  }, [currentSlug]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate read time
  const calculateReadTime = (content: string) => {
    const text = content?.replace(/<[^>]*>/g, '') || '';
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="mt-12 md:mt-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Related Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 md:mt-16 border-t border-gray-200 dark:border-gray-700 pt-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Image */}
            {post.mainImageUrl ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.mainImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Category Badge */}
                {post.categories && post.categories.length > 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {post.categories[0].title}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold opacity-50">
                  {post.title.charAt(0)}
                </span>
                {/* Category Badge */}
                {post.categories && post.categories.length > 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 bg-white/90 text-blue-600 text-xs font-semibold rounded-full">
                      {post.categories[0].title}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span>{formatDate(post.createdAt || post.createdOn || '')}</span>
                <span>•</span>
                <span>{calculateReadTime(post.content)}</span>
              </div>

              {/* Author */}
              {post.user && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {post.user.profilePic ? (
                    <img
                      src={post.user.profilePic}
                      alt={`${post.user.firstname} ${post.user.lastname}`}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                      {post.user.firstname?.charAt(0) || 'A'}
                    </div>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {post.user.firstname} {post.user.lastname}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
