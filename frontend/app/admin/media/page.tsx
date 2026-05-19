'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { mediaAPI } from '@/app/lib/api';

interface MediaItem {
  publicId: string;
  url: string;
  filename?: string;
  size?: number;
  format?: string;
  folder?: string;
  createdAt?: string;
}

const FOLDERS = ['all', 'blog', 'posts', 'projects', 'profiles'];

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [folder, setFolder] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (cursor?: string, replace = false) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      try {
        const data = await mediaAPI.list({
          folder: folder === 'all' ? undefined : folder,
          cursor,
          limit: 30,
        });
        setItems((prev) =>
          replace ? data.items : [...prev, ...data.items],
        );
        setNextCursor(data.nextCursor);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load media');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [folder],
  );

  useEffect(() => {
    fetchPage(undefined, true);
  }, [fetchPage]);

  const handleDelete = async (item: MediaItem) => {
    if (
      !confirm(
        `Delete "${item.filename ?? item.publicId}"?\n\nThis cannot be undone. Posts using this image will show a broken link.`,
      )
    )
      return;
    setDeleting(item.publicId);
    try {
      await mediaAPI.delete(item.publicId);
      setItems((prev) => prev.filter((i) => i.publicId !== item.publicId));
      toast.success('Deleted');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Media
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and delete uploaded images
          </p>
        </div>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {FOLDERS.map((f) => (
            <option key={f} value={f}>
              {f === 'all' ? 'All folders' : f}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No media files in this folder.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.publicId}
                className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => setLightbox(item.url)}
                  className="block w-full aspect-square bg-gray-100 dark:bg-gray-900"
                  aria-label="View full size"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.filename ?? item.publicId}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
                <div className="p-3">
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                    title={item.filename ?? item.publicId}
                  >
                    {item.filename ?? item.publicId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatSize(item.size)}
                    {item.format ? ` · ${item.format}` : ''}
                    {item.folder ? ` · ${item.folder}` : ''}
                  </p>
                  {item.createdAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(item.createdAt)}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        toast.success('URL copied');
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.publicId}
                      className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === item.publicId ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {nextCursor && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchPage(nextCursor)}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
