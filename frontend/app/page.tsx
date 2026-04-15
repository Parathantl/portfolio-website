import { Metadata } from 'next';
import Link from 'next/link';
import Hero from './components/portfolio/Hero';
import ProjectsList from './components/portfolio/ProjectsList';
import SkillsSection from './components/portfolio/SkillsSection';
import BlogList from './components/blog/BlogList';
import { serverFetch } from './lib/server-api';
import { SITE_URL } from './lib/structured-data';
import { Post } from './types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

interface AboutData {
  fullName: string;
  tagline: string;
  bio: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

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

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiencyLevel: number;
  iconUrl?: string;
  displayOrder: number;
  isVisible: boolean;
}

async function getAbout(): Promise<AboutData | null> {
  try {
    return await serverFetch<AboutData>('/portfolio/about', { revalidate: 3600 });
  } catch {
    return null;
  }
}

async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const projects = await serverFetch<Project[]>('/portfolio/projects/featured', { revalidate: 3600 });
    return projects.slice(0, 3);
  } catch {
    return [];
  }
}

async function getSkills(): Promise<Skill[]> {
  try {
    return await serverFetch<Skill[]>('/portfolio/skills', { revalidate: 3600 });
  } catch {
    return [];
  }
}

async function getRecentPosts(): Promise<Post[]> {
  try {
    const posts = await serverFetch<Post[]>('/post', { revalidate: 3600 });
    return Array.isArray(posts) ? posts.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [about, projects, skills, posts] = await Promise.all([
    getAbout(),
    getFeaturedProjects(),
    getSkills(),
    getRecentPosts(),
  ]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Section */}
      <Hero
        fullName={about?.fullName || 'Parathan Thiyagalingam'}
        tagline={about?.tagline || 'Full Stack Developer & Technical Blogger'}
        bio={about?.bio || 'Welcome to my portfolio and blog'}
        profileImageUrl={about?.profileImageUrl}
        linkedinUrl={about?.linkedinUrl}
        githubUrl={about?.githubUrl}
        twitterUrl={about?.twitterUrl}
      />

      {/* Featured Projects Section */}
      <section aria-label="Featured Projects" className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Check out some of my recent work
            </p>
          </div>
          <ProjectsList featured={true} limit={3} initialData={projects} />
          <div className="text-center mt-8">
            <Link
              href="/portfolio/projects"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              View All Projects →
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section aria-label="Skills and Technologies" className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Skills & Technologies
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Technologies I work with
            </p>
          </div>
          <SkillsSection initialData={skills} />
          <div className="text-center mt-8">
            <Link
              href="/portfolio/skills"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              View All Skills →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts Section */}
      <section aria-label="Recent Blog Posts" className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Posts
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Latest articles and insights
            </p>
          </div>
          <BlogList limit={3} initialPosts={posts} />
        </div>
      </section>

      {/* Contact CTA Section */}
      <section aria-label="Contact" className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Have a project in mind or just want to connect? I&apos;d love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get In Touch
            </Link>
            <Link
              href="/portfolio"
              className="inline-block px-8 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 rounded-lg font-semibold transition-colors"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
