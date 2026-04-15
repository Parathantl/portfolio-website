'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async () => {
    setStatus('loading');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/newsletter/unsubscribe/${token}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message);

        // Redirect to home after 5 seconds
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Unsubscribe failed. Please try again.');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {status === 'confirm' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unsubscribe from Newsletter
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to unsubscribe from all newsletter updates?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleUnsubscribe}
                className="block w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Yes, Unsubscribe
              </button>
              <Link
                href={`/newsletter/preferences/${token}`}
                className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Manage Preferences Instead
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your request...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Unsubscribed Successfully
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              We&apos;re sorry to see you go! You can always subscribe again from our blog.
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Redirecting to home page in 5 seconds...
            </p>

            <div className="space-y-3">
              <Link
                href="/blog"
                className="block w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Visit Blog
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

            <div className="space-y-3">
              <button
                onClick={handleUnsubscribe}
                className="block w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="block w-full px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
