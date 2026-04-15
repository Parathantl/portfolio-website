'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/app/lib/config';
import { blogAPI } from '@/app/lib/api';
import { Category as CategoryType, MasterCategory } from '@/app/types/blog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Category Item Component
function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryType;
  onEdit: (category: CategoryType) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between ${
        isDragging ? 'z-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {category.title}
          </h3>
          {category.masterCategory && (
            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {category.masterCategory.name}
            </span>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            /{category.slug}
          </span>
        </div>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        )}
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => onEdit(category)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    masterCategoryId: 0,
    slug: '',
    displayOrder: 1,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
    fetchMasterCategories();
  }, []);

  // Refresh master categories when form is shown
  useEffect(() => {
    if (showAddForm) {
      fetchMasterCategories();
    }
  }, [showAddForm]);

  const fetchCategories = async () => {
    try {
      const data = await blogAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterCategories = async (showToast = false) => {
    try {
      const data = await blogAPI.getMasterCategories();
      setMasterCategories(data);
      if (showToast) {
        toast.success('Master categories refreshed!');
      }
    } catch (error) {
      console.error('Error fetching master categories:', error);
      toast.error('Failed to load master categories');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convert number fields to actual numbers
    const parsedValue = (name === 'masterCategoryId' || name === 'displayOrder')
      ? parseInt(value) || 0
      : value;

    setFormData(prev => ({ ...prev, [name]: parsedValue }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      masterCategoryId: masterCategories.length > 0 ? masterCategories[0].id : 0,
      slug: '',
      displayOrder: 1,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ensure numbers are properly formatted
      const data = {
        ...formData,
        masterCategoryId: Number(formData.masterCategoryId),
        displayOrder: Number(formData.displayOrder),
      };

      console.log('Submitting category data:', data); // Debug log

      if (editingId) {
        const result = await blogAPI.updateCategory(editingId, data);
        console.log('Update result:', result); // Debug log
      } else {
        await blogAPI.createCategory(data);
      }

      toast.success(`Category ${editingId ? 'updated' : 'created'} successfully!`);
      resetForm();
      await fetchCategories(); // Wait for categories to reload
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Failed to ${editingId ? 'update' : 'create'} category`);
    }
  };

  const handleEdit = (category: CategoryType) => {
    setFormData({
      title: category.title,
      description: category.description,
      masterCategoryId: category.masterCategoryId,
      slug: category.slug,
      displayOrder: category.displayOrder,
    });
    setEditingId(category.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await blogAPI.deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    // Reorder categories locally
    const reorderedCategories = arrayMove(categories, oldIndex, newIndex);

    // Update displayOrder for all categories
    const updatedCategories = reorderedCategories.map((cat, index) => ({
      ...cat,
      displayOrder: index + 1,
    }));

    // Update local state immediately for smooth UX
    setCategories(updatedCategories);

    // Send update to backend
    try {
      await blogAPI.reorderCategories(
        updatedCategories.map((cat) => ({
          id: cat.id,
          displayOrder: cat.displayOrder,
        }))
      );

      toast.success('Categories reordered successfully!');
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Failed to save new order');
      // Revert to original order on error
      fetchCategories();
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage blog categories for Tamil and Technical content
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., JavaScript, Tamil Stories"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Master Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => fetchMasterCategories(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                    title="Refresh master categories"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                <select
                  name="masterCategoryId"
                  value={formData.masterCategoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Master Category</option>
                  {masterCategories.map((mc) => (
                    <option key={mc.id} value={mc.id}>
                      {mc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Brief description of this category..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="javascript-tutorials"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  URL-friendly version (auto-generated from name)
                </p>
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
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No categories yet. Add your first category to get started!
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((cat) => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {categories.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
