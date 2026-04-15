import { Metadata } from 'next';
import SkillsSection from '../../components/portfolio/SkillsSection';
import { serverFetch } from '@/app/lib/server-api';
import { getBreadcrumbSchema, getItemListSchema, SITE_URL } from '../../lib/structured-data';

interface Skill {
  id: number;
  name: string;
  category: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Skills & Technologies',
  description: 'Technologies and tools I use to bring ideas to life. Full stack development skills including JavaScript, TypeScript, React, Node.js, and more.',
  alternates: { canonical: '/portfolio/skills' },
  openGraph: {
    title: 'Skills & Technologies',
    description: 'Technologies and tools I use to bring ideas to life.',
    url: `${SITE_URL}/portfolio/skills`,
    type: 'website',
  },
};

async function getSkills(): Promise<Skill[]> {
  try {
    return await serverFetch<Skill[]>('/portfolio/skills', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export default async function SkillsPage() {
  const skills = await getSkills();

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Portfolio', url: `${SITE_URL}/portfolio` },
    { name: 'Skills', url: `${SITE_URL}/portfolio/skills` },
  ]);

  const skillListSchema = skills.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Technical Skills',
        description: 'Technologies and tools used by Parathan Thiyagalingam',
        numberOfItems: skills.length,
        itemListElement: skills.map((skill, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'DefinedTerm',
            name: skill.name,
            inDefinedTermSet: skill.category,
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
      {skillListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(skillListSchema) }}
        />
      )}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Skills & Technologies
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Technologies and tools I use to bring ideas to life
            </p>
          </div>

          <SkillsSection />
        </div>
      </div>
    </>
  );
}
