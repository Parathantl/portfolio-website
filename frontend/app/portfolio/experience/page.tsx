import { Metadata } from 'next';
import ExperienceTimeline from '../../components/portfolio/ExperienceTimeline';
import { serverFetch } from '@/app/lib/server-api';
import { getBreadcrumbSchema, SITE_URL, PERSON_ID } from '../../lib/structured-data';

interface Experience {
  id: number;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Work Experience',
  description: 'My professional journey and career highlights as a Full Stack Developer.',
  alternates: { canonical: '/portfolio/experience' },
  openGraph: {
    title: 'Work Experience',
    description: 'My professional journey and career highlights.',
    url: `${SITE_URL}/portfolio/experience`,
    type: 'website',
  },
};

async function getExperience(): Promise<Experience[]> {
  try {
    return await serverFetch<Experience[]>('/portfolio/experience', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export default async function ExperiencePage() {
  const experiences = await getExperience();

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Portfolio', url: `${SITE_URL}/portfolio` },
    { name: 'Experience', url: `${SITE_URL}/portfolio/experience` },
  ]);

  const experienceListSchema = experiences.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Professional Experience',
        description: 'Work experience and career history of Parathan Thiyagalingam',
        numberOfItems: experiences.length,
        itemListElement: experiences.map((exp, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'OrganizationRole',
            roleName: exp.title,
            startDate: exp.startDate,
            endDate: exp.endDate || undefined,
            memberOf: {
              '@type': 'Organization',
              name: exp.company,
              location: exp.location
                ? { '@type': 'Place', name: exp.location }
                : undefined,
            },
          },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {experienceListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(experienceListSchema) }}
        />
      )}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Work Experience
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              My professional journey and career highlights
            </p>
          </div>

          <div className="flex justify-center">
            <ExperienceTimeline />
          </div>
        </div>
      </div>
    </>
  );
}
