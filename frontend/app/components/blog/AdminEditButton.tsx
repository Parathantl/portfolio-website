'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';

interface AdminEditButtonProps {
  postId: number;
}

/**
 * Admin-only "Edit" affordance shown on the public post page.
 *
 * This is a single-author blog (registration disabled, no roles), so a valid
 * session === the owner. We reuse the same /auth/authstatus check the admin
 * layout and navbar use. Visibility is UX only — the edit page and the
 * PATCH /post backend route are independently JWT-guarded.
 */
export default function AdminEditButton({ postId }: AdminEditButtonProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE_URL}/auth/authstatus`, { withCredentials: true })
      .then((response) => {
        if (!cancelled && response.data?.status && response.data?.user) {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        // anonymous visitor or expired session -> no edit button
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href={`/admin/posts/${postId}/edit`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium shadow-sm transition-colors"
      title="Edit this post"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit post
    </Link>
  );
}
