'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/app/lib/config';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Mobile', 'Other'];

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiencyLevel: number;
  iconUrl?: string;
  displayOrder: number;
  isVisible: boolean;
}

export default function EditSkill() {
  const router = useRouter();
  const params = useParams();
  const skillId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend',
    proficiencyLevel: 50,
    iconUrl: '',
    displayOrder: 1,
    isVisible: true,
  });

  useEffect(() => {
    fetchSkill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId]);

  const fetchSkill = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/skills/${skillId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skill');
      }

      const data: Skill = await response.json();

      setFormData({
        name: data.name,
        category: data.category,
        proficiencyLevel: data.proficiencyLevel,
        iconUrl: data.iconUrl || '',
        displayOrder: data.displayOrder,
        isVisible: data.isVisible,
      });
    } catch (error) {
      console.error('Error fetching skill:', error);
      toast.error('Failed to load skill');
      router.push('/admin/skills');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'range' || type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/skills/${skillId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update skill');
      }

      toast.success('Skill updated successfully!');
      router.push('/admin/skills');
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill');
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
            {[1, 2, 3, 4].map((i) => (
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
          Edit Skill
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update skill information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="space-y-6">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., React, Node.js, PostgreSQL"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Proficiency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proficiency Level: {formData.proficiencyLevel}%
            </label>
            <input
              type="range"
              name="proficiencyLevel"
              value={formData.proficiencyLevel}
              onChange={handleChange}
              min="0"
              max="100"
              step="5"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>

          {/* Icon URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon URL
            </label>
            <input
              type="url"
              name="iconUrl"
              value={formData.iconUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/icon.svg"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Optional: URL to a skill icon or logo
            </p>
          </div>

          {/* Display Order and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Visible on Portfolio
              </label>
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
              onClick={() => router.push('/admin/skills')}
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
