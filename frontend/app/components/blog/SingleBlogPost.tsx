'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { blogAPI } from '@/app/lib/api';
import { Post } from '@/app/types/blog';
import SocialShare from '@/app/components/blog/SocialShare';
import RelatedPosts from '@/app/components/blog/RelatedPosts';
import ReadingProgress from '@/app/components/blog/ReadingProgress';

import NewsletterSignup from '@/app/components/blog/NewsletterSignup';
import 'quill/dist/quill.snow.css';
import '@enzedonline/quill-blot-formatter2/dist/css/quill-blot-formatter2.css';

interface SingleBlogPostProps {
  slug: string;
  post: Post;
}

export default function SingleBlogPost({ slug, post }: SingleBlogPostProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (post && post.content) {
      // Sanitize content
      const clean = DOMPurify.sanitize(post.content);
      setSanitizedContent(clean);
    }
  }, [post]);

  // Add click handlers to images for lightbox
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('.prose')) {
        const img = target as HTMLImageElement;
        setLightboxImage(img.src);
      }
    };

    document.addEventListener('click', handleImageClick);
    return () => document.removeEventListener('click', handleImageClick);
  }, []);

  // Add copy buttons to code blocks
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.ql-editor .ql-code-block-container');

      codeBlocks.forEach((block) => {
        const codeElement = block as HTMLElement;

        // Skip if button already exists
        if (codeElement.querySelector('.copy-code-button')) return;

        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="copy-text">Copy</span>
        `;

        button.addEventListener('click', async () => {
          const code = codeElement.textContent || '';
          try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = `
              <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="copy-text">Copied!</span>
            `;
            setTimeout(() => {
              button.innerHTML = `
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="copy-text">Copy</span>
              `;
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });

        codeElement.style.position = 'relative';
        codeElement.appendChild(button);
      });
    };

    // Add buttons after content loads
    const timer = setTimeout(addCopyButtons, 100);
    return () => clearTimeout(timer);
  }, [sanitizedContent]);

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };

    if (lightboxImage) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxImage]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate read time
  const calculateReadTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 md:py-12">
        <style jsx global>{`
        /* Make images responsive and clickable */
        .ql-editor img {
          max-width: 100% !important;
          height: auto !important;
          cursor: pointer !important;
        }

        /* Mobile responsive - override fixed widths */
        @media (max-width: 768px) {
          .ql-editor img,
          .ql-editor [class^="ql-image-align-"] {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        /* Optimized Typography for readability */
        .ql-editor {
          font-size: 16px;
          line-height: 1.6;
        }

        .ql-editor p {
          margin-bottom: 1em;
          line-height: 1.6;
        }

        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3,
        .ql-editor h4,
        .ql-editor h5,
        .ql-editor h6 {
          margin-top: 1.5em;
          margin-bottom: 0.6em;
          font-weight: 700;
          line-height: 1.3;
        }

        .ql-editor h1 { font-size: 2em; }
        .ql-editor h2 { font-size: 1.625em; }
        .ql-editor h3 { font-size: 1.375em; }

        .ql-editor ul,
        .ql-editor ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        .ql-editor li {
          margin-bottom: 0.3em;
          line-height: 1.6;
        }

        .ql-editor blockquote {
          margin: 1.25em 0;
          padding-left: 1em;
          font-style: italic;
        }

        /* Inline code styling */
        .ql-editor code {
          font-size: 0.875em;
          padding: 0.2em 0.5em;
          border-radius: 4px;
          background-color: rgba(150, 150, 150, 0.1);
          border: 1px solid rgba(150, 150, 150, 0.2);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
          color: #e83e8c;
        }

        /* Dark mode inline code */
        .dark .ql-editor code {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ff6b9d;
        }

        /* Code block container styling - Quill uses div.ql-code-block-container */
        .ql-editor .ql-code-block-container {
          margin: 1.25em 0 !important;
          padding: 1.25em !important;
          border-radius: 8px !important;
          overflow-x: auto !important;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          position: relative !important;
        }

        .dark .ql-editor .ql-code-block-container {
          background: linear-gradient(135deg, #0f172a 0%, #020617 100%) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }

        /* Individual code lines - Quill uses div.ql-code-block for each line */
        .ql-editor .ql-code-block {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace !important;
          font-size: 0.9em !important;
          color: #e2e8f0 !important;
          line-height: 1.7 !important;
          white-space: pre !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Copy button styling */
        .copy-code-button {
          position: absolute;
          top: 0.75em;
          right: 0.75em;
          display: flex;
          align-items: center;
          gap: 0.4em;
          padding: 0.4em 0.75em;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #e2e8f0;
          font-size: 0.75em;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .copy-code-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .copy-code-button:active {
          transform: translateY(0);
        }

        .copy-code-button .copy-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .copy-code-button .copy-text {
          font-weight: 500;
        }

        /* Scrollbar styling for code blocks */
        .ql-editor pre::-webkit-scrollbar {
          height: 8px;
        }

        .ql-editor pre::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .ql-editor pre::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .ql-editor pre::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        /* Responsive typography - balanced for readability */
        @media (min-width: 768px) {
          .ql-editor {
            font-size: 17px;
            line-height: 1.7;
          }

          .ql-editor p {
            line-height: 1.7;
          }

          .ql-editor li {
            line-height: 1.7;
          }

          .ql-editor h1 { font-size: 2.25em; }
          .ql-editor h2 { font-size: 1.875em; }
          .ql-editor h3 { font-size: 1.5em; }
        }

        @media (min-width: 1024px) {
          .ql-editor {
            font-size: 18px;
            line-height: 1.7;
          }

          .ql-editor p {
            line-height: 1.7;
          }

          .ql-editor li {
            line-height: 1.7;
          }

          .ql-editor h1 { font-size: 2.5em; }
          .ql-editor h2 { font-size: 2em; }
          .ql-editor h3 { font-size: 1.625em; }
        }
      `}</style>

      <article className="w-full">
        {/* Header Section - Centered with max-width for readability */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-block text-blue-600 dark:text-blue-400 hover:underline mb-4 md:mb-6 text-sm md:text-base"
          >
            ← Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-6 md:mb-8">
            {/* Category Badges */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((category) => {
                  const masterCategorySlug = category.masterCategory?.slug || 'blog';
                  const blogPath = `/blog/${masterCategorySlug}`;

                  return (
                    <Link
                      key={category.id}
                      href={blogPath}
                      className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm md:text-base font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {category.title}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
              {/* Author */}
              <div className="flex items-center gap-2">
                {post.user?.profilePic ? (
                  <img
                    src={post.user.profilePic}
                    alt={`${post.user.firstname} ${post.user.lastname}`}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {post.user?.firstname?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="font-medium">
                  {post.user?.firstname} {post.user?.lastname}
                </span>
              </div>

              <span className="hidden sm:inline">•</span>
              <span className="text-xs md:text-sm">{formatDate(post.createdAt || post.createdOn || '')}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs md:text-sm">{calculateReadTime(post.content)}</span>
            </div>
          </header>
        </div>

        {/* Featured Image - Full Width */}
        {post.mainImageUrl && (
          <div className="w-full mb-8 md:mb-12">
            <img
              src={post.mainImageUrl}
              alt={post.title}
              className="w-full h-64 md:h-[500px] lg:h-[600px] xl:h-[700px] object-cover"
            />
          </div>
        )}

        {/* Content Section - Centered with generous max-width */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">

          {/* Social Share */}
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : `https://parathan.com/blog/${slug}`}
            title={post.title}
          />

          {/* Article Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-10 lg:p-16 xl:p-20">
            <div
              className="ql-editor prose dark:prose-invert max-w-none prose-base md:prose-lg lg:prose-xl xl:prose-2xl
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:text-base md:prose-p:text-lg lg:prose-p:text-xl
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-700
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-img:rounded-xl prose-img:shadow-lg prose-img:transition-transform prose-img:hover:scale-[1.01]
                prose-img:w-full
                prose-headings:leading-snug prose-headings:mb-4 prose-headings:mt-8
                prose-h1:text-2xl md:prose-h1:text-3xl lg:prose-h1:text-4xl xl:prose-h1:text-5xl prose-h1:leading-snug
                prose-h2:text-xl md:prose-h2:text-2xl lg:prose-h2:text-3xl xl:prose-h2:text-4xl prose-h2:leading-snug
                prose-h3:text-lg md:prose-h3:text-xl lg:prose-h3:text-2xl xl:prose-h3:text-3xl prose-h3:leading-snug
                prose-li:text-base md:prose-li:text-lg lg:prose-li:text-xl
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic
                prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-blockquote:text-lg md:prose-blockquote:text-xl"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>

          {/* Newsletter Signup */}
          <NewsletterSignup
            currentMasterCategorySlug={
              post.categories?.[0]?.masterCategory?.slug
            }
          />

          {/* Related Posts */}
          <RelatedPosts currentSlug={slug} />

          {/* Footer */}
          <div className="mt-8 md:mt-12 text-center">
            <Link
              href="/blog"
              className="inline-block px-6 py-2.5 md:px-8 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm md:text-base"
            >
              View More Posts
            </Link>
          </div>
        </div>
      </article>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-2 md:p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl max-h-full w-full">
            {/* Close Button */}
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 md:-top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Close"
            >
              <svg
                className="w-8 h-8 md:w-10 md:h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] md:max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Hint Text */}
            <p className="text-center text-white text-xs md:text-sm mt-2 md:mt-4 opacity-75">
              Click outside or press ESC to close
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
