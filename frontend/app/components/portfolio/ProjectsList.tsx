'use client';

import { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import { portfolioAPI } from '@/app/lib/api';

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

interface ProjectsListProps {
  featured?: boolean;
  limit?: number;
  initialData?: Project[];
}

export default function ProjectsList({ featured = false, limit, initialData }: ProjectsListProps) {
  const hasInitialData = initialData && initialData.length > 0;
  const [projects, setProjects] = useState<Project[]>(hasInitialData ? initialData : []);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && initialData.length > 0) return; // Skip fetch only if server provided actual data

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = featured
          ? await portfolioAPI.getFeaturedProjects()
          : await portfolioAPI.getProjects();

        const projectsToShow = limit ? data.slice(0, limit) : data;
        setProjects(projectsToShow);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [featured, limit, initialData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
