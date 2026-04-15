'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { portfolioAPI } from '@/app/lib/api';
import { API_BASE_URL } from '@/app/lib/config';

interface Experience {
  id: number;
  company: string;
  position: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location: string;
  companyUrl?: string;
  displayOrder: number;
}

export default function ExperienceManagement() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const data = await portfolioAPI.getExperience();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      await fetch(`${API_BASE_URL}/portfolio/experience/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      toast.success('Experience deleted successfully');
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Failed to delete experience');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Work Experience
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your professional work experience
          </p>
        </div>
        <Link
          href="/admin/experience/add"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-center sm:self-start"
        >
          + Add Experience
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No work experience yet. Add your first experience to get started!
          </p>
          <Link
            href="/admin/experience/add"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Add Experience
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((exp) => (
              <div
                key={exp.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {exp.position}
                      </h3>
                      {exp.isCurrent && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full self-start">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      {exp.companyUrl ? (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-semibold"
                        >
                          {exp.company}
                        </a>
                      ) : (
                        <span className="text-lg font-semibold">{exp.company}</span>
                      )}
                      <span>•</span>
                      <span>{exp.location}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {exp.description}
                    </p>

                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Key Responsibilities:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {exp.responsibilities.map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 sm:ml-4">
                    <Link
                      href={`/admin/experience/${exp.id}/edit`}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
