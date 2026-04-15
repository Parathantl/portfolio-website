'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { portfolioAPI } from '@/app/lib/api';
import { API_BASE_URL } from '@/app/lib/config';
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

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiencyLevel: number;
  iconUrl?: string;
  displayOrder: number;
  isVisible: boolean;
}

// Sortable Skill Item Component
function SortableSkillItem({
  skill,
  onToggleVisibility,
  onDelete,
}: {
  skill: Skill;
  onToggleVisibility: (skill: Skill) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${
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

      <div className="flex items-center gap-4 flex-1">
        {skill.iconUrl && (
          <img
            src={skill.iconUrl}
            alt={skill.name}
            className="w-10 h-10 object-contain"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {skill.name}
            </h3>
            {!skill.isVisible && (
              <span className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                Hidden
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 max-w-md">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${skill.proficiencyLevel}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
              {skill.proficiencyLevel}%
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => onToggleVisibility(skill)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
          title={skill.isVisible ? 'Hide' : 'Show'}
        >
          {skill.isVisible ? '👁️' : '🙈'}
        </button>
        <Link
          href={`/admin/skills/${skill.id}/edit`}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(skill.id)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function SkillsManagement() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      // Use admin endpoint to get ALL skills including hidden ones
      const response = await fetch(`${API_BASE_URL}/portfolio/skills/admin`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await fetch(`${API_BASE_URL}/portfolio/skills/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      toast.success('Skill deleted successfully');
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const toggleVisibility = async (skill: Skill) => {
    try {
      await fetch(`${API_BASE_URL}/portfolio/skills/${skill.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isVisible: !skill.isVisible }),
      });
      toast.success(`Skill ${skill.isVisible ? 'hidden' : 'shown'}`);
      fetchSkills();
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill');
    }
  };

  const handleDragEnd = async (event: DragEndEvent, category: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Get skills from this category only
    const categorySkills = skills.filter((s) => s.category === category);
    const oldIndex = categorySkills.findIndex((s) => s.id === active.id);
    const newIndex = categorySkills.findIndex((s) => s.id === over.id);

    // Reorder within category
    const reorderedCategorySkills = arrayMove(categorySkills, oldIndex, newIndex);

    // Update displayOrder for category skills
    const updatedCategorySkills = reorderedCategorySkills.map((skill, index) => ({
      ...skill,
      displayOrder: index + 1,
    }));

    // Merge with other categories
    const otherSkills = skills.filter((s) => s.category !== category);
    const allSkills = [...otherSkills, ...updatedCategorySkills].sort((a, b) => {
      if (a.category === b.category) {
        return a.displayOrder - b.displayOrder;
      }
      return a.category.localeCompare(b.category);
    });

    // Update local state immediately
    setSkills(allSkills);

    // Send update to backend
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/skills/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          skills: updatedCategorySkills.map((s) => ({
            id: s.id,
            displayOrder: s.displayOrder,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder skills');
      }

      toast.success('Skills reordered successfully!');
    } catch (error) {
      console.error('Error reordering skills:', error);
      toast.error('Failed to save new order');
      // Revert to original order on error
      fetchSkills();
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Skills
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your technical skills and proficiency levels
          </p>
        </div>
        <Link
          href="/admin/skills/add"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          + Add Skill
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-32"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No skills yet. Add your first skill to get started!
          </p>
          <Link
            href="/admin/skills/add"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Add Skill
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {category}
              </h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, category)}
              >
                <SortableContext
                  items={categorySkills.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {categorySkills.map((skill) => (
                      <SortableSkillItem
                        key={skill.id}
                        skill={skill}
                        onToggleVisibility={toggleVisibility}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
