import Link from 'next/link';
import { Post } from '@/app/types/blog';
import { stripMarkdown } from '@/app/lib/strip-markdown';
import SocialShare from '@/app/components/blog/SocialShare';
import RelatedPosts from '@/app/components/blog/RelatedPosts';
import ReadingProgress from '@/app/components/blog/ReadingProgress';
import NewsletterSignup from '@/app/components/blog/NewsletterSignup';
import BlogPostInteractions from '@/app/components/blog/BlogPostInteractions';
import AuthorBio from '@/app/components/blog/AuthorBio';
import AdminEditButton from '@/app/components/blog/AdminEditButton';
import { SITE_URL } from '@/app/lib/structured-data';

interface AuthorInfo {
  name: string;
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

interface BlogPostContentProps {
  slug: string;
  post: Post;
  sanitizedContent: string;
  authorInfo?: AuthorInfo;
}

export default function BlogPostContent({ slug, post, sanitizedContent, authorInfo }: BlogPostContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadTime = (content: string) => {
    const text = stripMarkdown(content);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  };

  const postUrl = `${SITE_URL}/blog/${slug}`;

  return (
    <>
      <ReadingProgress />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 md:py-12">
      <article className="w-full">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-between gap-4 mb-4 md:mb-6"
          >
            <Link
              href="/blog"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm md:text-base"
            >
              ← Back to Blog
            </Link>
            <AdminEditButton postId={post.id} />
          </nav>

          <header className="mb-6 md:mb-8">
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((category) => {
                  // Prefer the child-category page; fall back to the master
                  // category (or the blog index) when a slug is missing.
                  const masterCategorySlug = category.masterCategory?.slug || 'blog';
                  const blogPath = category.slug
                    ? `/blog/category/${category.slug}`
                    : `/blog/${masterCategorySlug}`;

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

            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt for speakable/AEO */}
            {post.excerpt && (
              <p className="blog-post-excerpt text-lg text-gray-600 dark:text-gray-400 mb-4">
                {post.excerpt}
              </p>
            )}

            {(() => {
              const authorImage =
                authorInfo?.profileImageUrl || post.user?.profilePic;
              const authorName =
                authorInfo?.name ||
                [post.user?.firstname, post.user?.lastname]
                  .filter(Boolean)
                  .join(' ') ||
                'Author';
              const authorInitial = authorName.charAt(0).toUpperCase();
              return (
                <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
                  <div className="flex items-center gap-2">
                    {authorImage ? (
                      <img
                        src={authorImage}
                        alt={authorName}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {authorInitial}
                      </div>
                    )}
                    <span className="font-medium">{authorName}</span>
                  </div>

                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs md:text-sm">{formatDate(post.createdAt || post.createdOn || '')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs md:text-sm">{calculateReadTime(post.content)}</span>
                </div>
              );
            })()}
          </header>
        </div>

        {/* Featured Image */}
        {post.mainImageUrl && (
          <figure className="w-full mb-8 md:mb-12">
            <img
              src={post.mainImageUrl}
              alt={post.title}
              className="w-full h-64 md:h-[500px] lg:h-[600px] xl:h-[700px] object-cover"
            />
          </figure>
        )}

        {/* Content Section */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">

          <div className="max-w-3xl mx-auto">
            <SocialShare
              url={postUrl}
              title={post.title}
            />
          </div>

          {/* Article Content - SSR rendered, visible to crawlers.
              max-w-3xl keeps the reading column ~70 chars wide for legibility. */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm max-w-3xl mx-auto p-6 md:p-8 lg:p-10">
            <div
              className="prose md:prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-1
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium hover:prose-a:text-blue-700
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-img:rounded-xl prose-img:shadow-md prose-img:w-full"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>

          {authorInfo && (
            <div className="max-w-3xl mx-auto">
              <AuthorBio
                name={authorInfo.name}
                bio={authorInfo.bio}
                profileImageUrl={authorInfo.profileImageUrl}
                linkedinUrl={authorInfo.linkedinUrl}
                githubUrl={authorInfo.githubUrl}
                twitterUrl={authorInfo.twitterUrl}
              />
            </div>
          )}

          <aside aria-label="Newsletter and related content">
            <NewsletterSignup
              currentMasterCategorySlug={
                post.categories?.[0]?.masterCategory?.slug
              }
            />

            <RelatedPosts currentSlug={slug} />
          </aside>

          <nav className="mt-8 md:mt-12 text-center" aria-label="Blog navigation">
            <Link
              href="/blog"
              className="inline-block px-6 py-2.5 md:px-8 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm md:text-base"
            >
              View More Posts
            </Link>
          </nav>
        </section>
      </article>

      {/* Client-side interactions (lightbox, copy buttons) */}
      <BlogPostInteractions />
      </div>
    </>
  );
}
