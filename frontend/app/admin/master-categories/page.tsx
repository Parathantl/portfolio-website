'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { blogAPI } from '@/app/lib/api';
import { MasterCategory } from '@/app/types/blog';

export default function MasterCategoriesPage() {
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    displayOrder: 1,
  });

  useEffect(() => {
    fetchMasterCategories();
  }, []);

  const fetchMasterCategories = async () => {
    try {
      const data = await blogAPI.getMasterCategories();
      setMasterCategories(data);
    } catch (error) {
      toast.error('Failed to fetch master categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure numbers are properly formatted
      const data = {
        ...formData,
        displayOrder: Number(formData.displayOrder),
      };

      if (editingCategory) {
        await blogAPI.updateMasterCategory(editingCategory.id, data);
        toast.success('Master category updated successfully');
      } else {
        await blogAPI.createMasterCategory(data);
        toast.success('Master category created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchMasterCategories();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save master category');
      console.error(error);
    }
  };

  const handleEdit = (category: MasterCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      isActive: category.isActive,
      displayOrder: category.displayOrder,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this master category?')) {
      return;
    }
    try {
      await blogAPI.deleteMasterCategory(id);
      toast.success('Master category deleted successfully');
      fetchMasterCategories();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete master category');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      displayOrder: 1,
    });
    setEditingCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Parse value based on field type
    let parsedValue: any;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'displayOrder') {
      parsedValue = parseInt(value) || 1;
    } else {
      parsedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Master Categories</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          + Add Master Category
        </button>
      </div>

      {/* Master Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masterCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h3>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    category.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Slug: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{category.slug}</span>
            </p>

            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Display Order: {category.displayOrder}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {masterCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No master categories yet</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Create Your First Master Category
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {editingCategory ? 'Edit Master Category' : 'Add Master Category'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Tech, Tamil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                    placeholder="e.g., tech, tamil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of this blog category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
