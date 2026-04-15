import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { MasterCategory, Post } from '@/app/types/blog';
import MasterCategoryPage from '@/app/components/blog/MasterCategoryPage';
import BlogPostContent from '@/app/components/blog/BlogPostContent';
import { serverFetch } from '@/app/lib/server-api';
import {
  getBlogPostingSchema,
  getTechArticleSchema,
  getFAQPageSchema,
  getHowToSchema,
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getPersonSchema,
  SITE_URL,
} from '@/app/lib/structured-data';
import {
  extractFAQFromHTML,
  extractHowToSteps,
  calculateWordCount,
  wordCountToISO8601,
} from '@/app/lib/content-parser';

interface PageParams {
  params: {
    slug: string;
  };
}

interface AboutData {
  fullName?: string;
  tagline?: string;
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

async function getAboutData(): Promise<AboutData | null> {
  try {
    return await serverFetch<AboutData>('/portfolio/about', { revalidate: 86400 });
  } catch {
    return null;
  }
}

async function getPageData(slug: string): Promise<{
  type: 'category' | 'post' | null;
  data: MasterCategory | Post | null;
}> {
  try {
    const category = await serverFetch<MasterCategory>(
      `/master-categories/slug/${slug}`,
      { revalidate: 3600 }
    );
    if (category && category.isActive) {
      return { type: 'category', data: category };
    }
  } catch (error) {
    // Not a category, try post
  }

  try {
    const post = await serverFetch<Post>(`/post/slug/${slug}`, {
      revalidate: 3600,
      tags: [`post-${slug}`],
    });
    if (post) {
      return { type: 'post', data: post };
    }
  } catch (error) {
    // Not found
  }

  return { type: null, data: null };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { type, data } = await getPageData(params.slug);

  if (!type || !data) {
    return { title: 'Page Not Found' };
  }

  if (type === 'category') {
    const category = data as MasterCategory;
    return {
      title: `${category.name} Blog`,
      description:
        category.description ||
        `Read articles about ${category.name} by Parathan Thiyagalingam.`,
      alternates: { canonical: `/blog/${params.slug}` },
      openGraph: {
        title: `${category.name} Blog`,
        description:
          category.description || `Read articles about ${category.name}.`,
        url: `${SITE_URL}/blog/${params.slug}`,
        type: 'website',
      },
    };
  }

  if (type === 'post') {
    const post = data as Post;
    const textContent = post.content?.replace(/<[^>]*>/g, '') || '';
    const description =
      post.excerpt || textContent.substring(0, 160) + '...';

    return {
      title: post.title,
      description,
      alternates: { canonical: `/blog/${params.slug}` },
      authors: [
        {
          name: post.user
            ? `${post.user.firstname} ${post.user.lastname}`
            : 'Parathan Thiyagalingam',
        },
      ],
      openGraph: {
        title: post.title,
        description,
        url: `${SITE_URL}/blog/${params.slug}`,
        type: 'article',
        publishedTime: post.createdAt?.toString(),
        modifiedTime: post.updatedAt?.toString(),
        images: post.mainImageUrl ? [post.mainImageUrl] : [],
        authors: [
          post.user
            ? `${post.user.firstname} ${post.user.lastname}`
            : 'Parathan Thiyagalingam',
        ],
        tags: post.categories?.map((c) => c.title),
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: post.mainImageUrl ? [post.mainImageUrl] : [],
      },
    };
  }

  return {};
}

export async function generateStaticParams() {
  try {
    const posts = await serverFetch<Post[]>('/post', { revalidate: 3600 });
    const masterCategories = await serverFetch<MasterCategory[]>(
      '/master-categories',
      { revalidate: 3600 }
    );

    const postParams = posts.map((post) => ({ slug: post.slug }));
    const categoryParams = masterCategories
      .filter((mc) => mc.isActive)
      .map((mc) => ({ slug: mc.slug }));

    return [...postParams, ...categoryParams];
  } catch {
    return [];
  }
}

export default async function DynamicBlogPage({ params }: PageParams) {
  const { type, data } = await getPageData(params.slug);

  if (!type || !data) {
    notFound();
  }

  const jsonLdBlocks: object[] = [];

  if (type === 'post') {
    const post = data as Post;
    const about = await getAboutData();

    // Server-side content sanitization - content will be in initial HTML
    const sanitizedContent = DOMPurify.sanitize(post.content || '');

    // Calculate content metrics
    const wordCount = calculateWordCount(post.content || '');
    const timeRequired = wordCountToISO8601(wordCount);
    const textContent = post.content?.replace(/<[^>]*>/g, '') || '';
    const abstract =
      post.excerpt || textContent.substring(0, 300) + '...';

    // Content-driven schema detection: extract from actual content, not hardcoded title checks
    const faqPairs = extractFAQFromHTML(post.content || '');
    const howToSteps = extractHowToSteps(post.content || '');

    // Use TechArticle if how-to steps were found, otherwise BlogPosting
    const hasFAQ = faqPairs.length >= 2;
    const hasHowTo = howToSteps.length >= 2;

    const articleSchema = hasHowTo
      ? getTechArticleSchema(post, { wordCount, timeRequired, abstract, articleBody: textContent })
      : getBlogPostingSchema(post, { wordCount, timeRequired, abstract, articleBody: textContent });
    jsonLdBlocks.push(articleSchema);

    // FAQ schema - emitted if 2+ Q&A pairs found in content (any language, any category)
    if (hasFAQ) {
      const faqSchema = getFAQPageSchema(faqPairs);
      if (faqSchema) {
        jsonLdBlocks.push(faqSchema);
      }
    }

    // HowTo schema - emitted if 2+ steps found in content (any language, any category)
    if (hasHowTo) {
      const howToSchema = getHowToSchema(
        post.title,
        abstract,
        howToSteps,
        {
          totalTime: timeRequired,
          image: post.mainImageUrl,
        }
      );
      if (howToSchema) {
        jsonLdBlocks.push(howToSchema);
      }
    }

    // Breadcrumb schema
    const categoryName =
      post.categories?.[0]?.masterCategory?.name || 'Blog';
    const categorySlug =
      post.categories?.[0]?.masterCategory?.slug || 'blog';
    const breadcrumb = getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Blog', url: `${SITE_URL}/blog` },
      { name: categoryName, url: `${SITE_URL}/blog/${categorySlug}` },
      { name: post.title, url: `${SITE_URL}/blog/${params.slug}` },
    ]);
    jsonLdBlocks.push(breadcrumb);

    // Enhanced Person schema with social links for E-E-A-T authority
    if (about) {
      const personSchema = getPersonSchema(about);
      jsonLdBlocks.push(personSchema);
    }

    const authorInfo = about
      ? {
          name: about.fullName || 'Parathan Thiyagalingam',
          bio: about.bio,
          profileImageUrl: about.profileImageUrl,
          linkedinUrl: about.linkedinUrl,
          githubUrl: about.githubUrl,
          twitterUrl: about.twitterUrl,
        }
      : undefined;

    return (
      <>
        {jsonLdBlocks.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <BlogPostContent
          slug={params.slug}
          post={post}
          sanitizedContent={sanitizedContent}
          authorInfo={authorInfo}
        />
      </>
    );
  }

  // Category page
  if (type === 'category') {
    const category = data as MasterCategory;

    // Server-fetch posts for this category so they appear in initial HTML
    let categoryPosts: Post[] = [];
    try {
      categoryPosts = await serverFetch<Post[]>(
        `/post?masterCategory=${params.slug}`,
        { revalidate: 3600 }
      );
    } catch {
      // Will fall back to client-side fetch
    }

    const categorySchema = getCollectionPageSchema(
      `${category.name} Blog`,
      category.description || `Articles about ${category.name}`,
      `${SITE_URL}/blog/${params.slug}`
    );
    jsonLdBlocks.push(categorySchema);

    const breadcrumb = getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Blog', url: `${SITE_URL}/blog` },
      { name: category.name, url: `${SITE_URL}/blog/${params.slug}` },
    ]);
    jsonLdBlocks.push(breadcrumb);

    return (
      <>
        {jsonLdBlocks.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <MasterCategoryPage masterCategory={category} initialPosts={categoryPosts} />
      </>
    );
  }

  return null;
}
