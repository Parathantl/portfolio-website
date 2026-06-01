import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Category, PaginatedPosts } from '@/app/types/blog';
import { serverFetch } from '@/app/lib/server-api';
import ChildCategoryPage from '@/app/components/blog/ChildCategoryPage';
import { getAuthorImage } from '@/app/lib/author';
import {
  getCollectionPageSchema,
  getBreadcrumbSchema,
  SITE_URL,
} from '@/app/lib/structured-data';

interface PageParams {
  params: {
    slug: string;
  };
}

const PAGE_SIZE = 9;

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const category = await serverFetch<Category>(`/category/slug/${slug}`, {
      revalidate: 3600,
    });
    // Backend returns null (HTTP 200) when nothing matches the slug.
    return category && category.id ? category : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const title = `${category.title}${
    category.masterCategory ? ` · ${category.masterCategory.name}` : ''
  }`;
  const description =
    category.description ||
    `Articles in ${category.title} by Parathan Thiyagalingam.`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/category/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/category/${params.slug}`,
      type: 'website',
    },
  };
}

export default async function ChildCategoryRoute({ params }: PageParams) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  // Server-fetch first page so posts are in the initial HTML and SSR-ready.
  let categoryPage: PaginatedPosts = {
    items: [],
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };
  let authorImage: string | undefined;
  try {
    [categoryPage, authorImage] = await Promise.all([
      serverFetch<PaginatedPosts>(
        `/post?page=1&limit=${PAGE_SIZE}&category=${params.slug}`,
        { revalidate: 3600 },
      ),
      getAuthorImage(),
    ]);
  } catch {
    // Fall back to client-side fetch inside BlogList.
  }

  const master = category.masterCategory;
  const breadcrumbTrail = [
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
    ...(master
      ? [{ name: master.name, url: `${SITE_URL}/blog/${master.slug}` }]
      : []),
    { name: category.title, url: `${SITE_URL}/blog/category/${params.slug}` },
  ];

  const jsonLdBlocks: object[] = [
    getCollectionPageSchema(
      `${category.title} Articles`,
      category.description || `Articles in ${category.title}`,
      `${SITE_URL}/blog/category/${params.slug}`,
    ),
    getBreadcrumbSchema(breadcrumbTrail),
  ];

  return (
    <>
      {jsonLdBlocks.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ChildCategoryPage
        category={category}
        initialPosts={categoryPage.items}
        initialTotal={categoryPage.total}
        initialPage={categoryPage.page}
        pageSize={categoryPage.limit}
        authorImage={authorImage}
      />
    </>
  );
}
