'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogAPI } from '../lib/api';
import { MasterCategory } from '../types/blog';

const Footer: React.FC = () => {
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);

  useEffect(() => {
    const fetchMasterCategories = async () => {
      try {
        const categories = await blogAPI.getMasterCategories();
        // Filter active categories and sort by displayOrder
        const activeCategories = categories
          .filter((cat: MasterCategory) => cat.isActive)
          .sort((a: MasterCategory, b: MasterCategory) => a.displayOrder - b.displayOrder);
        setMasterCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching master categories:', error);
      }
    };

    fetchMasterCategories();
  }, []);

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Parathan</h2>
            <p className="text-gray-400 mb-4">
              Full Stack Developer & Technical Blogger. Building amazing web applications and sharing knowledge.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://github.com/parathantl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/parathantl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/parathantl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Portfolio Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Portfolio</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/portfolio/about" className="text-gray-400 hover:text-white transition-colors">
                  About Me
                </Link>
              </li>
              <li>
                <Link href="/portfolio/projects" className="text-gray-400 hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/portfolio/skills" className="text-gray-400 hover:text-white transition-colors">
                  Skills
                </Link>
              </li>
              <li>
                <Link href="/portfolio/experience" className="text-gray-400 hover:text-white transition-colors">
                  Experience
                </Link>
              </li>
            </ul>
          </div>

          {/* Blog Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Blog</h3>
            <ul className="space-y-2">
              {masterCategories.map((category) => (
                <li key={category.id}>
                  <Link href={`/blog/${category.slug}`} className="text-gray-400 hover:text-white transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Other Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Me
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Parathan Thiyagalingam. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                Portfolio
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
