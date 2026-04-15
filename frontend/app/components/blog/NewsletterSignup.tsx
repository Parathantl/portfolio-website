'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MasterCategory {
  id: number;
  name: string;
  slug: string;
}

interface NewsletterSignupProps {
  currentMasterCategorySlug?: string; // Current post's master category
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ currentMasterCategorySlug }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch master categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/master-categories`);

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();

        // Validate that data is an array
        if (Array.isArray(data) && data.length > 0) {
          setMasterCategories(data);

          // Auto-select based on context
          if (currentMasterCategorySlug) {
            // Find and select only the current category
            const currentCategory = data.find((cat: MasterCategory) => cat.slug === currentMasterCategorySlug);
            if (currentCategory) {
              setSelectedCategories([currentCategory.id]);
            } else {
              // Fallback: select all if current category not found
              setSelectedCategories(data.map((cat: MasterCategory) => cat.id));
            }
          } else {
            // No context - select all categories by default
            setSelectedCategories(data.map((cat: MasterCategory) => cat.id));
          }
        } else {
          console.warn('No categories returned or invalid data format');
          setMasterCategories([]);
          setSelectedCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setMasterCategories([]);
        setSelectedCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [currentMasterCategorySlug]);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    // Only validate category selection if categories are available
    if (masterCategories.length > 0 && selectedCategories.length === 0) {
      setStatus('error');
      setMessage('Please select at least one category');
      return;
    }

    // If no categories loaded, show helpful error
    if (masterCategories.length === 0) {
      setStatus('error');
      setMessage('Categories are unavailable. Please check your connection and try again.');
      return;
    }

    setStatus('loading');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          masterCategoryIds: selectedCategories,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(
          data.message ||
            'Please check your email to verify your subscription. Link valid for 24 hours.',
        );
        setEmail('');

        // Reset after 10 seconds (longer for verification message)
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 10000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error('Newsletter signup error:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 md:p-8 my-12 border border-blue-100 dark:border-gray-700">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {currentMasterCategorySlug
            ? `Subscribe to ${masterCategories.find(cat => cat.slug === currentMasterCategorySlug)?.name || ''} Updates`
            : 'Stay Updated'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get the latest posts delivered right to your inbox. No spam, unsubscribe anytime.
        </p>

        {/* Form */}
        {status !== 'success' ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            {/* Loading Categories */}
            {loadingCategories && (
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading categories...</p>
              </div>
            )}

            {/* Category Selection */}
            {!loadingCategories && masterCategories.length > 0 && (
              <div className="mb-4">
                {currentMasterCategorySlug && !showAllCategories ? (
                  /* Context-aware: Show only current category with option to expand */
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Subscribing to:{' '}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {masterCategories.find(cat => cat.slug === currentMasterCategorySlug)?.name}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Subscribe to other categories too
                    </button>
                  </div>
                ) : (
                  /* Show all categories */
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-left">
                      Subscribe to:
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {masterCategories.map((category) => (
                        <label
                          key={category.id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                            selectedCategories.includes(category.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="hidden"
                          />
                          <span className="font-medium">{category.name}</span>
                          {selectedCategories.includes(category.id) && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </label>
                      ))}
                    </div>
                    {currentMasterCategorySlug && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAllCategories(false);
                          const currentCategory = masterCategories.find(cat => cat.slug === currentMasterCategorySlug);
                          if (currentCategory) {
                            setSelectedCategories([currentCategory.id]);
                          }
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:underline mt-2"
                      >
                        ← Just {masterCategories.find(cat => cat.slug === currentMasterCategorySlug)?.name}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* No Categories Warning */}
            {!loadingCategories && masterCategories.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  ⚠️ Categories are currently unavailable. Please try again later or contact support.
                </p>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || loadingCategories || (!loadingCategories && masterCategories.length > 0 && selectedCategories.length === 0)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap"
                title={
                  loadingCategories
                    ? 'Loading categories...'
                    : (!loadingCategories && masterCategories.length > 0 && selectedCategories.length === 0)
                    ? 'Please select at least one category'
                    : 'Subscribe to newsletter'
                }
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : loadingCategories ? (
                  'Loading...'
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
          </form>
        ) : null}

        {/* Status Messages */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              status === 'success'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
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

        {/* Privacy Note */}
        {status !== 'success' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsletterSignup;
