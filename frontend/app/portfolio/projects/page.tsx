import { Metadata } from 'next';
import ProjectsList from '../../components/portfolio/ProjectsList';
import { serverFetch } from '@/app/lib/server-api';
import { getBreadcrumbSchema, getItemListSchema, SITE_URL } from '../../lib/structured-data';

interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A showcase of my development work and side projects. Full stack web applications, tools, and more.',
  alternates: { canonical: '/portfolio/projects' },
  openGraph: {
    title: 'Projects',
    description: 'A showcase of my development work and side projects.',
    url: `${SITE_URL}/portfolio/projects`,
    type: 'website',
  },
};

async function getProjects(): Promise<Project[]> {
  try {
    return await serverFetch<Project[]>('/portfolio/projects', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Portfolio', url: `${SITE_URL}/portfolio` },
    { name: 'Projects', url: `${SITE_URL}/portfolio/projects` },
  ]);

  const projectListSchema = projects.length > 0
    ? getItemListSchema(
        'Projects by Parathan Thiyagalingam',
        projects.map((p, i) => ({
          name: p.title,
          url: `${SITE_URL}/portfolio/projects/${p.id}`,
          position: i + 1,
        }))
      )
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {projectListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectListSchema) }}
        />
      )}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              My Projects
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A showcase of my development work and side projects
            </p>
          </div>

          <ProjectsList initialData={projects} />
        </div>
      </div>
    </>
  );
}
