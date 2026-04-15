import Link from 'next/link';

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    technologies: string[];
    imageUrl?: string;
    projectUrl?: string;
    githubUrl?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Project Image */}
      {project.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      {/* Project Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {project.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Links */}
        <div className="flex gap-4">
          <Link
            href={`/portfolio/projects/${project.id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            View Details →
          </Link>
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:underline font-semibold"
            >
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:underline font-semibold"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
