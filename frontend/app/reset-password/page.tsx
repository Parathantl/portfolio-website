'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { API_BASE_URL } from '../lib/config';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 6) errors.push('At least 6 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    return errors;
  };

  const passwordErrors = password ? validatePassword(password) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Please meet all password requirements');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        { token, password, confirmPassword }
      );

      setMessage(response.data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">
              Invalid reset link. Please request a new password reset.
            </p>
          </div>
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Request Password Reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {password && passwordErrors.length > 0 && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium">Password must contain:</p>
                <ul className="mt-1 space-y-1">
                  {['At least 6 characters', 'One uppercase letter', 'One lowercase letter', 'One number'].map((req) => (
                    <li
                      key={req}
                      className={
                        passwordErrors.includes(req)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }
                    >
                      {passwordErrors.includes(req) ? '✗' : '✓'} {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-300">
              {message}
            </p>
            <p className="mt-2 text-xs text-green-700 dark:text-green-400">
              Redirecting to login page...
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
