import { serverFetch } from './server-api';

/** Make a stored image URL safe for <img>/next-image (filenames may contain spaces). */
export function encodeAuthorImage(url?: string | null): string | undefined {
  return url ? url.replace(/ /g, '%20') : undefined;
}

/**
 * Single-author blog: every post card shows the same avatar — the portfolio
 * profile image. Fetched server-side (cached 24h) so listing pages share it as
 * a prop instead of each making a per-view client request.
 */
export async function getAuthorImage(): Promise<string | undefined> {
  try {
    const about = await serverFetch<{ profileImageUrl?: string }>(
      '/portfolio/about',
      { revalidate: 86400 },
    );
    return encodeAuthorImage(about?.profileImageUrl);
  } catch {
    return undefined;
  }
}
