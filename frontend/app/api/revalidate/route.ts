// On-demand revalidation endpoint.
//
// The blog post route (`/blog/[slug]`) is ISR-cached. When a post is created
// while still a draft, `notFound()` bakes a 404 into the full-route cache; once
// the post is published nothing invalidates that stale entry, so the live page
// keeps returning HTTP 404 with full content. The backend calls this endpoint
// after any post create/update/delete to flush the affected paths.
//
// This is a literal route, so it takes precedence over the `[...path]` proxy and
// runs inside the Next.js server (where revalidatePath/revalidateTag work).

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // Fail closed: if the server has no secret configured, refuse rather than
  // expose an unauthenticated cache-busting endpoint.
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, error: 'Revalidation is not configured' },
      { status: 503 }
    );
  }

  if (request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json(
      { revalidated: false, error: 'Invalid secret' },
      { status: 401 }
    );
  }

  let body: { paths?: string[]; tags?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { revalidated: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const paths = Array.isArray(body.paths) ? body.paths : [];
  const tags = Array.isArray(body.tags) ? body.tags : [];

  for (const path of paths) {
    if (typeof path === 'string' && path.startsWith('/')) {
      revalidatePath(path);
    }
  }
  for (const tag of tags) {
    if (typeof tag === 'string' && tag.length > 0) {
      revalidateTag(tag);
    }
  }

  return NextResponse.json({ revalidated: true, paths, tags });
}
