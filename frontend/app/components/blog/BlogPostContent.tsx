import Link from 'next/link';
import { Post } from '@/app/types/blog';
import SocialShare from '@/app/components/blog/SocialShare';
import RelatedPosts from '@/app/components/blog/RelatedPosts';
import ReadingProgress from '@/app/components/blog/ReadingProgress';
import NewsletterSignup from '@/app/components/blog/NewsletterSignup';
import BlogPostInteractions from '@/app/components/blog/BlogPostInteractions';
import AuthorBio from '@/app/components/blog/AuthorBio';
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
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
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
          <nav aria-label="Breadcrumb">
            <Link
              href="/blog"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline mb-4 md:mb-6 text-sm md:text-base"
            >
              ← Back to Blog
            </Link>
          </nav>

          <header className="mb-6 md:mb-8">
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

            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt for speakable/AEO */}
            {post.excerpt && (
              <p className="blog-post-excerpt text-lg text-gray-600 dark:text-gray-400 mb-4">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
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

          <SocialShare
            url={postUrl}
            title={post.title}
          />

          {/* Article Content - SSR rendered, visible to crawlers */}
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

          {authorInfo && (
            <AuthorBio
              name={authorInfo.name}
              bio={authorInfo.bio}
              profileImageUrl={authorInfo.profileImageUrl}
              linkedinUrl={authorInfo.linkedinUrl}
              githubUrl={authorInfo.githubUrl}
              twitterUrl={authorInfo.twitterUrl}
            />
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
