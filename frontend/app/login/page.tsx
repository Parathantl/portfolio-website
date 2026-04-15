"use client";
import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../lib/config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true, // Include credentials (cookies)
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (data.success) {
        toast.success('Login successful', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        // Redirect to admin after successful login
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        const errorMessage = data.message || 'Login failed';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      const errorMessage = 'An error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-3 bg-white dark:bg-gray-800 rounded shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm dark:text-red-400">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 dark:hover:bg-blue-800"
            >
              Login
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
