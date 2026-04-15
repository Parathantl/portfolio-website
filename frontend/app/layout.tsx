import React, { ReactNode } from 'react';
import { Metadata } from 'next';
import Navbar from './components/Navbar';
import './globals.css';
import { Inter } from 'next/font/google';
import Footer from './components/Footer';
import 'react-toastify/dist/ReactToastify.css';
import { getWebSiteSchema, getPersonSchema, SITE_URL } from './lib/structured-data';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Parathan Thiyagalingam - Full Stack Developer & Technical Blogger',
    template: '%s | Parathan Thiyagalingam',
  },
  description:
    'Full Stack Developer & Blogger. Portfolio, projects, and articles on technology, development, and more.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Parathan Thiyagalingam',
    title: 'Parathan Thiyagalingam - Full Stack Developer & Blogger',
    description:
      'Full Stack Developer & Blogger. Portfolio, projects, and articles on technology, development, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parathan Thiyagalingam',
    description:
      'Full Stack Developer & Blogger. Portfolio, projects, and articles on technology, development, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const websiteSchema = getWebSiteSchema();
  const personSchema = getPersonSchema();

  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" title="Parathan Thiyagalingam - Blog RSS Feed" href="/feed.xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="author" href="/llms.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className={`${inter.className} bg-gray-800`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
