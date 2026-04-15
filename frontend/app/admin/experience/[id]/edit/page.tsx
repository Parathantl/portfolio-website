'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
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

export default function EditExperience() {
  const router = useRouter();
  const params = useParams();
  const expId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    description: '',
    responsibilities: '',
    technologies: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    location: '',
    companyUrl: '',
    displayOrder: 1,
  });

  useEffect(() => {
    fetchExperience();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expId]);

  const fetchExperience = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/experience/${expId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch experience');
      }

      const data: Experience = await response.json();

      setFormData({
        company: data.company,
        position: data.position,
        description: data.description,
        responsibilities: data.responsibilities.join('\n'),
        technologies: data.technologies.join(', '),
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        isCurrent: data.isCurrent,
        location: data.location,
        companyUrl: data.companyUrl || '',
        displayOrder: data.displayOrder,
      });
    } catch (error) {
      console.error('Error fetching experience:', error);
      toast.error('Failed to load experience');
      router.push('/admin/experience');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Convert comma-separated strings to arrays
      const responsibilities = formData.responsibilities
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const technologies = formData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      const payload = {
        company: formData.company,
        position: formData.position,
        description: formData.description,
        responsibilities,
        technologies,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.isCurrent || !formData.endDate ? null : new Date(formData.endDate).toISOString(),
        isCurrent: formData.isCurrent,
        location: formData.location,
        companyUrl: formData.companyUrl || null,
        displayOrder: parseInt(formData.displayOrder.toString()),
      };

      const response = await fetch(`${API_BASE_URL}/portfolio/experience/${expId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update experience');
      }

      toast.success('Experience updated successfully!');
      router.push('/admin/experience');
    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error('Failed to update experience');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Work Experience
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update work experience information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="space-y-6">
          {/* Company and Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position/Title *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Senior Full Stack Developer"
              />
            </div>
          </div>

          {/* Location and Company URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company URL
              </label>
              <input
                type="url"
                name="companyUrl"
                value={formData.companyUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://company.com"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief overview of the role and your contributions..."
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Responsibilities
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter each responsibility on a new line"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter each responsibility on a new line
            </p>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Technologies Used
            </label>
            <input
              type="text"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="React, Node.js, PostgreSQL, AWS (comma-separated)"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter technologies separated by commas
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.isCurrent}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Current Position and Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Currently working here
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Lower numbers appear first
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/experience')}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
