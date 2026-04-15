'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/projects', label: 'Projects', icon: '💼' },
    { href: '/admin/skills', label: 'Skills', icon: '⚡' },
    { href: '/admin/experience', label: 'Experience', icon: '🏢' },
    { href: '/admin/about', label: 'About Info', icon: '👤' },
    { href: '/admin/posts', label: 'Blog Posts', icon: '📝' },
    { href: '/admin/master-categories', label: 'Master Categories', icon: '🗂️' },
    { href: '/admin/categories', label: 'Categories', icon: '📂' },
    { href: '/admin/contact', label: 'Messages', icon: '✉️' },
    { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 bg-gray-800 text-white min-h-screen p-6
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
          <p className="text-gray-400 text-sm">Manage your portfolio & blog</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span>View Site</span>
          </Link>
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
