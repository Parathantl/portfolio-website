interface ExperienceCardProps {
  experience: {
    company: string;
    position: string;
    description: string;
    responsibilities: string[];
    technologies?: string[];
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    location?: string;
    companyUrl?: string;
  };
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="relative pl-8 pb-12 border-l-2 border-blue-500 last:pb-0">
      {/* Timeline Dot */}
      <div className="absolute left-[-9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900" />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {experience.position}
            </h3>
            {experience.companyUrl ? (
              <a
                href={experience.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-600 dark:text-blue-400 hover:underline"
              >
                {experience.company}
              </a>
            ) : (
              <p className="text-lg text-blue-600 dark:text-blue-400">
                {experience.company}
              </p>
            )}
          </div>
          {experience.isCurrent && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full font-semibold self-start">
              Current
            </span>
          )}
        </div>

        {/* Date and Location */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {formatDate(experience.startDate)} -{' '}
            {experience.isCurrent ? 'Present' : formatDate(experience.endDate!)}
          </span>
          {experience.location && <span>📍 {experience.location}</span>}
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {experience.description}
        </p>

        {/* Responsibilities */}
        {experience.responsibilities.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Key Responsibilities:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {experience.responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Technologies */}
        {experience.technologies && experience.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {experience.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
