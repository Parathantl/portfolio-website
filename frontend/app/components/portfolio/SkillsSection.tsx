'use client';

import { useEffect, useState } from 'react';
import SkillCard from './SkillCard';
import { portfolioAPI } from '@/app/lib/api';

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiencyLevel: number;
  iconUrl?: string;
  displayOrder: number;
  isVisible: boolean;
}

interface SkillsSectionProps {
  initialData?: Skill[];
}

export default function SkillsSection({ initialData }: SkillsSectionProps = {}) {
  const hasInitialData = initialData && initialData.length > 0;
  const [skills, setSkills] = useState<Skill[]>(hasInitialData ? initialData : []);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && initialData.length > 0) return; // Skip fetch only if server provided actual data

    const fetchSkills = async () => {
      try {
        setLoading(true);
        const data = await portfolioAPI.getSkills();
        setSkills(data);
      } catch (err) {
        setError('Failed to load skills');
        console.error('Error fetching skills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [initialData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 animate-pulse"
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

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (Object.keys(groupedSkills).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No skills added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category}>
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorySkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
