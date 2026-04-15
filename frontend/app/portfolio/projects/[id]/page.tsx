import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/app/lib/server-api';
import {
  getBreadcrumbSchema,
  getSoftwareSourceCodeSchema,
  SITE_URL,
} from '@/app/lib/structured-data';

interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  galleryImages?: string[];
  startDate: string;
  endDate?: string;
  featured: boolean;
}

interface PageParams {
  params: { id: string };
}

async function getProject(id: string): Promise<Project | null> {
  try {
    return await serverFetch<Project>(`/portfolio/projects/${id}`, {
      revalidate: 3600,
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const project = await getProject(params.id);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/portfolio/projects/${params.id}` },
    openGraph: {
      title: project.title,
      description: project.description,
      url: `${SITE_URL}/portfolio/projects/${params.id}`,
      type: 'article',
      images: project.imageUrl ? [project.imageUrl] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const projects = await serverFetch<Project[]>('/portfolio/projects', {
      revalidate: 3600,
    });
    return projects.map((project) => ({ id: String(project.id) }));
  } catch {
    return [];
  }
}

export default async function ProjectDetailPage({ params }: PageParams) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Portfolio', url: `${SITE_URL}/portfolio` },
    { name: 'Projects', url: `${SITE_URL}/portfolio/projects` },
    { name: project.title, url: `${SITE_URL}/portfolio/projects/${params.id}` },
  ]);

  const projectSchema = getSoftwareSourceCodeSchema(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/portfolio/projects"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline mb-6"
            >
              ← Back to Projects
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-96 object-cover"
                />
              )}

              <div className="p-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {project.title}
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 mb-6">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      View Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold transition-colors"
                    >
                      View on GitHub
                    </a>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    About This Project
                  </h2>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {project.longDescription}
                  </div>
                </div>
              </div>
            </div>

            {project.galleryImages && project.galleryImages.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Project Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.galleryImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${project.title} screenshot ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
