'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { portfolioAPI, blogAPI } from '../lib/api';

interface Stats {
  projects: number;
  skills: number;
  experience: number;
  posts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    skills: 0,
    experience: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, skills, experience, posts] = await Promise.all([
          portfolioAPI.getProjects(),
          portfolioAPI.getSkills(),
          portfolioAPI.getExperience(),
          blogAPI.getPosts(),
        ]);

        setStats({
          projects: projects.length,
          skills: skills.length,
          experience: experience.length,
          posts: posts.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: '💼', color: 'bg-blue-500', href: '/admin/projects' },
    { label: 'Skills', value: stats.skills, icon: '⚡', color: 'bg-green-500', href: '/admin/skills' },
    { label: 'Experience', value: stats.experience, icon: '🏢', color: 'bg-purple-500', href: '/admin/experience' },
    { label: 'Blog Posts', value: stats.posts, icon: '📝', color: 'bg-orange-500', href: '/admin/posts' },
  ];

  const quickActions = [
    { label: 'Add Project', href: '/admin/projects/add', icon: '➕', color: 'bg-blue-600' },
    { label: 'Add Skill', href: '/admin/skills/add', icon: '➕', color: 'bg-green-600' },
    { label: 'Add Experience', href: '/admin/experience/add', icon: '➕', color: 'bg-purple-600' },
    { label: 'Write Post', href: '/admin/posts/add', icon: '✍️', color: 'bg-orange-600' },
    { label: 'Edit About', href: '/admin/about', icon: '✏️', color: 'bg-pink-600' },
    { label: 'Manage Categories', href: '/admin/categories', icon: '📂', color: 'bg-indigo-600' },
  ];

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your admin panel. Manage your portfolio and blog content here.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
                <div className="h-24"></div>
              </div>
            ))}
          </>
        ) : (
          statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{card.icon}</span>
                <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                  {card.value}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {card.label}
              </h3>
            </Link>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} hover:opacity-90 text-white rounded-lg p-4 flex items-center gap-3 transition-opacity`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity / Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Update your About information with your details</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Add your projects to showcase your work</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>List your skills and proficiency levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Add your work experience timeline</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Create categories for Tamil and Tech blogs</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Start writing blog posts</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Site Links
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                <span>🏠</span>
                <span>View Homepage</span>
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                <span>💼</span>
                <span>View Portfolio</span>
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                <span>📝</span>
                <span>View Blog</span>
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                <span>✉️</span>
                <span>View Contact Page</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
