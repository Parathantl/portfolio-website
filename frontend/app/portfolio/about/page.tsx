import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/app/lib/server-api';
import { getBreadcrumbSchema, getPersonSchema, SITE_URL } from '@/app/lib/structured-data';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface AboutData {
  fullName: string;
  tagline: string;
  bio: string;
  longBio: string;
  profileImageUrl?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export const metadata: Metadata = {
  title: 'About Me',
  description: 'Learn more about Parathan Thiyagalingam - Full Stack Developer & Technical Blogger. Background, skills, and professional journey.',
  alternates: { canonical: '/portfolio/about' },
  openGraph: {
    title: 'About Me',
    description: 'Learn more about Parathan Thiyagalingam - Full Stack Developer & Technical Blogger.',
    url: `${SITE_URL}/portfolio/about`,
    type: 'profile',
  },
};

async function getAbout(): Promise<AboutData | null> {
  try {
    return await serverFetch<AboutData>('/portfolio/about', { revalidate: 3600 });
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const about = await getAbout();

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Portfolio', url: `${SITE_URL}/portfolio` },
    { name: 'About', url: `${SITE_URL}/portfolio/about` },
  ]);

  const personSchema = getPersonSchema(about || undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              About Me
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {about?.profileImageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={about.profileImageUrl}
                      alt={about.fullName || 'Profile'}
                      className="w-48 h-48 rounded-full object-cover border-4 border-blue-500"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {about?.fullName || 'Your Name'}
                  </h2>
                  <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">
                    {about?.tagline || 'Full Stack Developer'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {about?.bio || 'Welcome to my portfolio'}
                  </p>

                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    {about?.email && (
                      <p>
                        <strong>Email:</strong> {about.email}
                      </p>
                    )}
                    {about?.phone && (
                      <p>
                        <strong>Phone:</strong> {about.phone}
                      </p>
                    )}
                    {about?.location && (
                      <p>
                        <strong>Location:</strong> {about.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {about?.longBio && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    My Story
                  </h3>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {about.longBio}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {about?.resumeUrl && (
                  <a
                    href={about.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Download Resume
                  </a>
                )}
                {about?.githubUrl && (
                  <a
                    href={about.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {about?.linkedinUrl && (
                  <a
                    href={about.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {about?.twitterUrl && (
                  <a
                    href={about.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Twitter
                  </a>
                )}
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
