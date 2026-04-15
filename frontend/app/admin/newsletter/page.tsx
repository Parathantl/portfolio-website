'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/app/lib/config';

interface MasterCategory {
  id: number;
  name: string;
  slug: string;
}

interface Subscriber {
  email: string;
  categories: string[];
  subscribedAt: string;
}

interface SubscriberDetail {
  email: string;
  isActive: boolean;
  categories: MasterCategory[];
  subscribedAt: string;
}

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
  });
  const [subscriberStats, setSubscriberStats] = useState({
    totalSignups: 0,
    activeSubscribers: 0,
    unsubscribedCount: 0,
    unverifiedCount: 0,
  });

  // Fetch master categories and subscribers
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch master categories
      const categoriesRes = await fetch(`${API_BASE_URL}/master-categories`);
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        // Ensure it's an array
        if (Array.isArray(categoriesData)) {
          setMasterCategories(categoriesData);
        } else {
          console.error('Categories data is not an array:', categoriesData);
          setMasterCategories([]);
          toast.error('Invalid category data received');
        }
      } else {
        console.error('Failed to fetch categories');
        setMasterCategories([]);
        toast.error('Failed to fetch categories');
      }

      // Fetch subscriber stats (admin endpoint)
      const statsRes = await fetch(`${API_BASE_URL}/newsletter/stats`, {
        credentials: 'include',
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setSubscriberStats(statsData);
      } else {
        const errorText = await statsRes.text();
        console.error('Failed to fetch subscriber stats:', statsRes.status, errorText);
      }

      // Fetch all subscribers (admin endpoint)
      const subscribersRes = await fetch(`${API_BASE_URL}/newsletter/subscribers`, {
        credentials: 'include',
      });

      if (subscribersRes.ok) {
        const subscribersData = await subscribersRes.json();
        // Ensure it's an array
        const subsArray = Array.isArray(subscribersData) ? subscribersData : [];
        setSubscribers(subsArray);
        setFilteredSubscribers(subsArray);

        // Get current master categories state or use empty array
        const cats = masterCategories.length > 0 ? masterCategories : [];
        calculateStats(subsArray, cats);
      } else {
        toast.error('Failed to fetch subscribers');
        setSubscribers([]);
        setFilteredSubscribers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load newsletter data');
      setMasterCategories([]);
      setSubscribers([]);
      setFilteredSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subs: Subscriber[], categories: MasterCategory[]) => {
    const byCategory: Record<string, number> = {};

    categories.forEach((cat) => {
      byCategory[cat.name] = subs.filter((sub) =>
        sub.categories.includes(cat.name)
      ).length;
    });

    setStats({
      total: subs.length,
      byCategory,
    });
  };

  // Filter subscribers by category and search
  useEffect(() => {
    let filtered = [...subscribers];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((sub) =>
        sub.categories.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((sub) =>
        sub.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSubscribers(filtered);
  }, [selectedCategory, searchQuery, subscribers]);

  const handleExportCSV = () => {
    const csvContent = [
      ['Email', 'Categories', 'Subscribed At'],
      ...filteredSubscribers.map((sub) => [
        sub.email,
        sub.categories.join('; '),
        new Date(sub.subscribedAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading newsletter data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Newsletter Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your newsletter subscribers and view statistics
        </p>
      </div>

      {/* Statistics Cards - Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Subscribers */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Active Subscribers</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{subscriberStats.activeSubscribers}</p>
          <p className="text-xs opacity-75 mt-2">Verified & subscribed</p>
        </div>

        {/* Total Signups */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Signups</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{subscriberStats.totalSignups}</p>
          <p className="text-xs opacity-75 mt-2">All time signups</p>
        </div>

        {/* Unsubscribed */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Unsubscribed</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{subscriberStats.unsubscribedCount}</p>
          <p className="text-xs opacity-75 mt-2">Opted out</p>
        </div>

        {/* Unverified */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Pending Verification</h3>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{subscriberStats.unverifiedCount}</p>
          <p className="text-xs opacity-75 mt-2">Awaiting email verification</p>
        </div>
      </div>

      {/* Category Statistics */}
      {Array.isArray(masterCategories) && masterCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {masterCategories.map((category, index) => {
            const colors = [
              'from-green-500 to-green-600',
              'from-indigo-500 to-indigo-600',
              'from-pink-500 to-pink-600',
            ];
            return (
              <div
                key={category.id}
                className={`bg-gradient-to-br ${colors[index % colors.length]} rounded-lg shadow-lg p-6 text-white`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">{category.name}</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold">{stats.byCategory[category.name] || 0}</p>
                <p className="text-xs opacity-75 mt-2">Active subscribers</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Array.isArray(masterCategories) && masterCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subscribed Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-semibold">
                            {subscriber.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {subscriber.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {subscriber.categories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(subscriber.subscribedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
