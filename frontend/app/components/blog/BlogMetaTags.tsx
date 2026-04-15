'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';

interface BlogMetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

const BlogMetaTags: React.FC<BlogMetaTagsProps> = ({
  title,
  description,
  image,
  url,
  author,
  publishedTime,
  modifiedTime,
  tags,
}) => {
  useEffect(() => {
    // Set document title
    document.title = `${title} | Parathan's Blog`;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'author', content: author || 'Parathan' },

      // Open Graph
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: "Parathan's Blog" },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ];

    // Add image if available
    if (image) {
      metaTags.push(
        { property: 'og:image', content: image },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:image', content: image }
      );
    }

    // Add article metadata
    if (publishedTime) {
      metaTags.push({ property: 'article:published_time', content: publishedTime });
    }
    if (modifiedTime) {
      metaTags.push({ property: 'article:modified_time', content: modifiedTime });
    }
    if (author) {
      metaTags.push({ property: 'article:author', content: author });
    }

    // Add tags
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        metaTags.push({ property: 'article:tag', content: tag });
      });
      metaTags.push({ name: 'keywords', content: tags.join(', ') });
    }

    // Update or create meta tags
    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let metaTag = document.querySelector(selector);

      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (name) metaTag.setAttribute('name', name);
        if (property) metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }

      metaTag.setAttribute('content', content);
    });

    // Cleanup function
    return () => {
      // Reset title
      document.title = "Parathan's Blog";
    };
  }, [title, description, image, url, author, publishedTime, modifiedTime, tags]);

  return null; // This component doesn't render anything
};

export default BlogMetaTags;
