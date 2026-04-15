import Link from 'next/link';

interface AuthorBioProps {
  name: string;
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

export default function AuthorBio({
  name,
  bio,
  profileImageUrl,
  linkedinUrl,
  githubUrl,
  twitterUrl,
}: AuthorBioProps) {
  return (
    <aside className="mt-12 p-6 md:p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Written by
          </p>
          <Link
            href="/portfolio/about"
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {name}
          </Link>
          {bio && (
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base leading-relaxed">
              {bio}
            </p>
          )}
          <div className="flex gap-3 mt-3">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
              >
                GitHub
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
              >
                LinkedIn
              </a>
            )}
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-sky-500 transition-colors text-sm font-medium"
              >
                Twitter
              </a>
            )}
            <Link
              href="/portfolio/about"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              More about me
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
