'use client';

import { useEffect, useState } from 'react';

export default function BlogPostInteractions() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Add click handlers to images for lightbox
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('.prose')) {
        const img = target as HTMLImageElement;
        setLightboxImage(img.src);
      }
    };

    document.addEventListener('click', handleImageClick);
    return () => document.removeEventListener('click', handleImageClick);
  }, []);

  // Add copy buttons to code blocks
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.ql-editor .ql-code-block-container');

      codeBlocks.forEach((block) => {
        const codeElement = block as HTMLElement;

        if (codeElement.querySelector('.copy-code-button')) return;

        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="copy-text">Copy</span>
        `;

        button.addEventListener('click', async () => {
          const code = codeElement.textContent || '';
          try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = `
              <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="copy-text">Copied!</span>
            `;
            setTimeout(() => {
              button.innerHTML = `
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="copy-text">Copy</span>
              `;
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });

        codeElement.style.position = 'relative';
        codeElement.appendChild(button);
      });
    };

    const timer = setTimeout(addCopyButtons, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };

    if (lightboxImage) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxImage]);

  if (!lightboxImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-2 md:p-4 backdrop-blur-sm"
      onClick={() => setLightboxImage(null)}
    >
      <div className="relative max-w-7xl max-h-full w-full">
        <button
          onClick={() => setLightboxImage(null)}
          className="absolute -top-10 md:-top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close"
        >
          <svg
            className="w-8 h-8 md:w-10 md:h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <img
          src={lightboxImage}
          alt="Enlarged view"
          className="max-w-full max-h-[85vh] md:max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        />

        <p className="text-center text-white text-xs md:text-sm mt-2 md:mt-4 opacity-75">
          Click outside or press ESC to close
        </p>
      </div>
    </div>
  );
}
