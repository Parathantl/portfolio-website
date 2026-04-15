/**
 * Server-side API helper for fetching data in Server Components.
 * Uses INTERNAL_API_URL for Docker or falls back to localhost/public URL.
 * Includes ISR caching via next: { revalidate }.
 */

const getServerApiUrl = () => {
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://parathan.com';
  return `${siteUrl}/api`;
};

const SERVER_API_URL = getServerApiUrl();

export async function serverFetch<T>(
  path: string,
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): Promise<T> {
  const url = `${SERVER_API_URL}${path}`;

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    next: {},
  };

  if (options?.revalidate !== undefined) {
    fetchOptions.next!.revalidate = options.revalidate;
  } else {
    fetchOptions.next!.revalidate = 3600; // Default: 1 hour
  }

  if (options?.tags) {
    fetchOptions.next!.tags = options.tags;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`Server fetch failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

export { SERVER_API_URL };
