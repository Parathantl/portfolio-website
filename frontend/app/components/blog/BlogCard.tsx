import Link from 'next/link';
import DOMPurify from 'dompurify';
import { Post } from '@/app/types/blog';

interface BlogCardProps {
  post: Post & {
    createdOn?: string; // Legacy field name support
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  // Calculate read time (assuming 200 words per minute)
  const calculateReadTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get excerpt (first 150 characters)
  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  // Get category color based on master category
  const getCategoryColor = (masterCategoryName?: string) => {
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

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Featured Image */}
      {post.mainImageUrl && (
        <Link href={`/blog/${post.slug}`}>
          <div className="h-48 overflow-hidden cursor-pointer">
            <img
              src={post.mainImageUrl}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        </Link>
      )}

      <div className="p-6">
        {/* Category Badges */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(category.masterCategory?.name)}`}
              >
                {category.title}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {getExcerpt(post.content)}
        </p>

        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.user?.profilePic ? (
              <img
                src={post.user.profilePic}
                alt={`${post.user.firstname} ${post.user.lastname}`}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {post.user?.firstname?.charAt(0) || 'A'}
              </div>
            )}
            <span>
              {post.user?.firstname} {post.user?.lastname}
            </span>
          </div>

          {/* Date and Read Time */}
          <div className="flex items-center gap-3">
            <span>{formatDate(post.createdAt || post.createdOn || '')}</span>
            <span>•</span>
            <span>{calculateReadTime(post.content)}</span>
          </div>
        </div>

        {/* Read More Link */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          Read More →
        </Link>
      </div>
    </article>
  );
}
