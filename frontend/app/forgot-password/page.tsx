'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { API_BASE_URL } from '../lib/config';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email }
      );

      setMessage(response.data.message);
      setEmail(''); // Clear the form
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-300">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
