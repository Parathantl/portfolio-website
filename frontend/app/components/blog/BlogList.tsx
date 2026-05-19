'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogCard from './BlogCard';
import { blogAPI } from '@/app/lib/api';
import { Post, MasterCategory } from '@/app/types/blog';

interface BlogListProps {
  masterCategorySlug?: string; // route-level lock to one master (e.g. /blog/tech)
  limit?: number; // teaser mode: render initialPosts as-is, no pagination
  initialPosts?: Post[];
  initialTotal?: number;
  initialPage?: number;
  pageSize?: number;
  initialMasterCategories?: MasterCategory[];
  showFilters?: boolean;
}

const DEFAULT_PAGE_SIZE = 9;

export default function BlogList({
  masterCategorySlug,
  limit,
  initialPosts,
  initialTotal,
  initialPage,
  pageSize = DEFAULT_PAGE_SIZE,
  initialMasterCategories,
  showFilters = true,
}: BlogListProps) {
  const router = useRouter();
  const isTeaser = !!limit;
  const isRouteLocked = !!masterCategorySlug;

  const [posts, setPosts] = useState<Post[]>(initialPosts ?? []);
  const [total, setTotal] = useState<number>(
    initialTotal ?? initialPosts?.length ?? 0,
  );
  const [currentPage, setCurrentPage] = useState<number>(initialPage ?? 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMaster, setSelectedMaster] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>(
    initialMasterCategories ?? [],
  );

  // Debounce the search input → triggers refetch via debouncedQuery dep.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Skip the first fetch when server already provided initial data.
  const skipInitialFetch = useRef(
    !!initialPosts && initialPosts.length > 0 && (initialTotal ?? 0) > 0,
  );

  // Fetch master categories if not provided (dropdown needs them).
  useEffect(() => {
    if (isTeaser) return;
    if (masterCategories.length > 0) return;
    blogAPI
      .getMasterCategories()
      .then((data) => setMasterCategories(data))
      .catch(() => {
        // non-fatal: dropdown just stays empty
      });
  }, [isTeaser, masterCategories.length]);

  // Main fetch effect: any change to page/search/filter refetches from server.
  useEffect(() => {
    if (isTeaser) return;
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // Resolve master category slug: route lock wins over dropdown.
        let masterSlug: string | undefined = masterCategorySlug;
        if (!masterSlug && selectedMaster !== 'all') {
          masterSlug = masterCategories.find(
            (m) => String(m.id) === selectedMaster,
          )?.slug;
        }

        const data = await blogAPI.getPostsPaginated({
          page: currentPage,
          limit: pageSize,
          q: debouncedQuery || undefined,
          masterCategory: masterSlug,
        });

        if (cancelled) return;
        setPosts(Array.isArray(data?.items) ? data.items : []);
        setTotal(typeof data?.total === 'number' ? data.total : 0);
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching posts:', err);
          setError('Failed to load blog posts');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    isTeaser,
    currentPage,
    debouncedQuery,
    selectedMaster,
    masterCategorySlug,
    pageSize,
    masterCategories,
  ]);

  const totalPages = isTeaser
    ? 1
    : Math.max(1, Math.ceil(total / pageSize));
  const showPagination = !isTeaser && totalPages > 1;

  const getPageWindow = (
    current: number,
    totalP: number,
  ): (number | 'ellipsis')[] => {
    const candidates = [1, totalP, current - 1, current, current + 1];
    const pages = Array.from(new Set(candidates))
      .filter((p) => p >= 1 && p <= totalP)
      .sort((a, b) => a - b);
    const out: (number | 'ellipsis')[] = [];
    pages.forEach((p, i) => {
      if (i > 0 && p - pages[i - 1] > 1) out.push('ellipsis');
      out.push(p);
    });
    return out;
  };

  if (loading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      {showFilters && !isTeaser && (
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <select
            value={
              isRouteLocked
                ? (masterCategories.find(
                    (m) => m.slug === masterCategorySlug,
                  )?.id ?? 'all').toString()
                : selectedMaster
            }
            onChange={(e) => {
              const value = e.target.value;
              if (isRouteLocked) {
                if (value === 'all') {
                  router.push('/blog');
                  return;
                }
                const target = masterCategories.find(
                  (m) => String(m.id) === value,
                );
                if (target) router.push(`/blog/${target.slug}`);
                return;
              }
              setSelectedMaster(value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {masterCategories.map((master) => (
              <option key={master.id} value={master.id}>
                {master.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {debouncedQuery || selectedMaster !== 'all'
              ? 'No posts found matching your criteria.'
              : 'No blog posts available yet.'}
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
            loading ? 'opacity-60' : ''
          }`}
        >
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <nav
          aria-label="Posts pagination"
          className="flex justify-center items-center gap-2 mt-10 flex-wrap"
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          {getPageWindow(currentPage, totalPages).map((entry, idx) =>
            entry === 'ellipsis' ? (
              <span
                key={`e-${idx}`}
                className="px-2 text-gray-500 dark:text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                onClick={() => setCurrentPage(entry)}
                disabled={loading}
                aria-current={entry === currentPage ? 'page' : undefined}
                className={`min-w-[2.5rem] px-3 py-2 rounded-lg border transition-colors disabled:cursor-not-allowed ${
                  entry === currentPage
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {entry}
              </button>
            ),
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </nav>
      )}

      {/* Results Count */}
      {!isTeaser && total > 0 && (
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          Showing {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, total)} of {total} posts
        </div>
      )}
    </div>
  );
}
