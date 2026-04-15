'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../lib/config';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadEndpoint?: string;
  folder?: 'blog' | 'posts' | 'projects' | 'profiles';
  preview?: boolean;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  uploadEndpoint,
  folder = 'blog',
  preview = true,
}: ImageUploadProps) {
  // Build endpoint with folder query parameter
  const finalEndpoint = uploadEndpoint || `${API_BASE_URL}/post/upload-photo?folder=${folder}`;
  const [uploading, setUploading] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(finalEndpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.filePath);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            inputMode === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            inputMode === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Upload
        </button>
      </div>

      {/* URL Input Mode */}
      {inputMode === 'url' && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="https://example.com/image.jpg"
        />
      )}

      {/* Upload Mode */}
      {inputMode === 'upload' && (
        <div>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Supported formats: JPG, PNG, GIF, WebP (max 5MB)
          </p>
          {uploading && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Uploading...
            </p>
          )}
        </div>
      )}

      {/* Current URL Display (when in upload mode and URL exists) */}
      {inputMode === 'upload' && value && !uploading && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Current URL:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{value}</p>
        </div>
      )}

      {/* Image Preview */}
      {preview && value && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
          <img
            src={value}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
