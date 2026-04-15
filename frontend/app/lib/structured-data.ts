import { Post, Category } from '@/app/types/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://parathan.com';
const PERSON_ID = `${SITE_URL}/#person`;

export function getPersonSchema(about?: {
  fullName?: string;
  tagline?: string;
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  email?: string;
  location?: string;
}) {
  const sameAs: string[] = [];
  if (about?.githubUrl) sameAs.push(about.githubUrl);
  if (about?.linkedinUrl) sameAs.push(about.linkedinUrl);
  if (about?.twitterUrl) sameAs.push(about.twitterUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: about?.fullName || 'Parathan Thiyagalingam',
    jobTitle: about?.tagline || 'Full Stack Developer & Technical Blogger',
    description: about?.bio || 'Full Stack Developer and Technical Blogger',
    url: `${SITE_URL}/portfolio/about`,
    image: about?.profileImageUrl,
    email: about?.email ? `mailto:${about.email}` : undefined,
    address: about?.location
      ? { '@type': 'PostalAddress', addressLocality: about.location }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsAbout: about?.tagline
      ? about.tagline.split(/[,&]/).map((s: string) => s.trim()).filter(Boolean)
      : undefined,
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Parathan Thiyagalingam',
    description: 'Full Stack Developer & Technical Blogger - Portfolio and Blog',
    url: SITE_URL,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Derive language from master category slug (extensible mapping)
function detectLanguage(post: Post): string | undefined {
  const masterSlug = post.categories?.[0]?.masterCategory?.slug;
  if (!masterSlug) return undefined;
  // Map master category slugs to ISO 639-1 language codes
  const languageMap: Record<string, string> = {
    tamil: 'ta',
    tech: 'en',
    english: 'en',
    hindi: 'hi',
    spanish: 'es',
    french: 'fr',
  };
  return languageMap[masterSlug] || undefined;
}

export function getBlogPostingSchema(
  post: Post,
  options?: {
    wordCount?: number;
    timeRequired?: string;
    abstract?: string;
    articleBody?: string;
  }
) {
  const textContent = post.content?.replace(/<[^>]*>/g, '') || '';
  const description =
    post.excerpt || textContent.substring(0, 160) + '...';
  const authorName = post.user
    ? `${post.user.firstname} ${post.user.lastname}`
    : 'Parathan Thiyagalingam';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: description,
    abstract: options?.abstract || description,
    articleBody: options?.articleBody || textContent,
    image: post.mainImageUrl ? [post.mainImageUrl] : undefined,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { '@type': 'Person', '@id': PERSON_ID, name: authorName },
    publisher: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Parathan Thiyagalingam',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    inLanguage: detectLanguage(post),
    isAccessibleForFree: true,
    wordCount: options?.wordCount,
    timeRequired: options?.timeRequired,
    articleSection: post.categories?.map((c) => c.title),
    keywords: post.categories?.map((c) => c.title)?.join(', '),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', '.blog-post-excerpt', 'article h2'],
    },
  };
}

export function getTechArticleSchema(
  post: Post,
  options?: {
    wordCount?: number;
    timeRequired?: string;
    abstract?: string;
    articleBody?: string;
  }
) {
  const base = getBlogPostingSchema(post, options);
  return {
    ...base,
    '@type': 'TechArticle',
  };
}

export function getFAQPageSchema(
  questions: Array<{ question: string; answer: string }>
) {
  if (questions.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function getHowToSchema(
  title: string,
  description: string,
  steps: Array<{ name: string; text: string }>,
  options?: {
    totalTime?: string;
    image?: string;
  }
) {
  if (steps.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    totalTime: options?.totalTime,
    image: options?.image,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function getItemListSchema(
  name: string,
  items: Array<{ name: string; url: string; position: number }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

export function getSoftwareSourceCodeSchema(project: {
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  id: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.description,
    codeRepository: project.githubUrl,
    url: project.projectUrl || `${SITE_URL}/portfolio/projects/${project.id}`,
    image: project.imageUrl,
    programmingLanguage: project.technologies,
    author: { '@type': 'Person', '@id': PERSON_ID },
  };
}

export function getContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Parathan Thiyagalingam',
    description: 'Get in touch with Parathan Thiyagalingam for project inquiries or collaboration.',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Person',
      '@id': PERSON_ID,
    },
  };
}

export function getCollectionPageSchema(
  name: string,
  description: string,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    author: { '@type': 'Person', '@id': PERSON_ID },
  };
}

export function getProfilePageSchema(about?: {
  fullName?: string;
  tagline?: string;
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${about?.fullName || 'Parathan Thiyagalingam'} - Portfolio`,
    description: about?.bio || 'Full Stack Developer portfolio and professional information.',
    url: `${SITE_URL}/portfolio`,
    mainEntity: {
      '@type': 'Person',
      '@id': PERSON_ID,
    },
  };
}

export { SITE_URL, PERSON_ID };
