'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/app/lib/config';

interface MasterCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

interface SubscriberPreferences {
  email: string;
  isVerified: boolean;
  subscribedCategories: MasterCategory[];
}

export default function NewsletterPreferencesPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<SubscriberPreferences | null>(null);
  const [allCategories, setAllCategories] = useState<MasterCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);

        // Fetch subscriber preferences
        const prefResponse = await fetch(`${API_BASE_URL}/newsletter/preferences/${token}`);

        if (!prefResponse.ok) {
          if (prefResponse.status === 404) {
            setError('Subscription not found. The link may have expired or is invalid.');
          } else {
            setError('Failed to load preferences. Please try again later.');
          }
          return;
        }

        const prefData = await prefResponse.json();
        setPreferences(prefData);
        setSelectedCategories(prefData.subscribedCategories.map((cat: MasterCategory) => cat.id));

        // Fetch all available categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/master-categories`);
        const categoriesData = await categoriesResponse.json();

        if (Array.isArray(categoriesData)) {
          const activeCategories = categoriesData.filter((cat: MasterCategory) => cat.isActive);
          setAllCategories(activeCategories);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load preferences. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPreferences();
    }
  }, [token]);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSavePreferences = async () => {
    if (selectedCategories.length === 0) {
      setStatus('error');
      setMessage('Please select at least one category to stay subscribed.');
      return;
    }

    setStatus('saving');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/preferences/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masterCategoryIds: selectedCategories,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Preferences updated successfully!');

        // Update local state
        if (preferences) {
          const updatedCategories = allCategories.filter(cat =>
            selectedCategories.includes(cat.id)
          );
          setPreferences({
            ...preferences,
            subscribedCategories: updatedCategories,
          });
        }

        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to update preferences. Please try again.');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to unsubscribe from all newsletter emails?')) {
      return;
    }

    setStatus('saving');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe/${token}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('You have been successfully unsubscribed.');

        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to unsubscribe. Please try again.');
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Newsletter Preferences
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {preferences?.email}
            </p>
            {preferences && !preferences.isVerified && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠️ Email not verified. Please check your inbox for the verification link.
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose your interests:
            </h2>
            <div className="space-y-3">
              {allCategories.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-start p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedCategories.includes(category.id)
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSavePreferences}
              disabled={status === 'saving' || selectedCategories.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              title={selectedCategories.length === 0 ? 'Select at least one category' : 'Save preferences'}
            >
              {status === 'saving' ? 'Saving...' : 'Save Preferences'}
            </button>
            <button
              onClick={handleUnsubscribe}
              disabled={status === 'saving'}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Unsubscribe
            </button>
          </div>

          {/* Status Messages */}
          {message && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                status === 'success'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {status === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
