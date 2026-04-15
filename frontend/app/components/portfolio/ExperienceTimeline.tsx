'use client';

import { useEffect, useState } from 'react';
import ExperienceCard from './ExperienceCard';
import { portfolioAPI } from '@/app/lib/api';

interface Experience {
  id: number;
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
  displayOrder: number;
}

export default function ExperienceTimeline() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);
        const data = await portfolioAPI.getExperience();
        setExperiences(data);
      } catch (err) {
        setError('Failed to load experience');
        console.error('Error fetching experience:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"
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

  if (experiences.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No work experience added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {experiences.map((experience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
    </div>
  );
}
