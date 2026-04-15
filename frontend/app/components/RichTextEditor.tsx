import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import BlotFormatter from '@enzedonline/quill-blot-formatter2';
import '@enzedonline/quill-blot-formatter2/dist/css/quill-blot-formatter2.css';
import { API_BASE_URL } from '../lib/config';

// Register the blot formatter module
Quill.register('modules/blotFormatter', BlotFormatter);

interface RichTextEditorProps {
  onChange: (content: string) => void;
  value?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ onChange, value }) => {
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);
  const isInitializedRef = useRef(false);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/post/upload-photo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Image upload failed');
      }

      const data = await response.json();
      return data.filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif,image/webp');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }

        // Show loading indicator
        const range = quillInstanceRef.current?.getSelection();
        if (range) {
          quillInstanceRef.current?.insertText(range.index, 'Uploading image...');
        }

        const url = await uploadImage(file);

        // Remove loading text
        if (range && quillInstanceRef.current) {
          quillInstanceRef.current?.deleteText(range.index, 'Uploading image...'.length);

          if (url) {
            quillInstanceRef.current?.insertEmbed(range.index, 'image', url);
            // Move cursor to next position after image
            quillInstanceRef.current?.setSelection(range.index + 1, 0);
          }
        }
      }
    };
  };

  // Initialize Quill only once
  useEffect(() => {
    if (quillRef.current && !isInitializedRef.current) {
      quillInstanceRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'font': [] }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'align': [] }],
              ['blockquote', 'code-block'],
              ['link', 'image', 'video'],
              ['clean'],
            ],
            handlers: {
              image: handleImageUpload,
            },
          },
          blotFormatter: {},
        },
      });

      quillInstanceRef.current.on('text-change', () => {
        if (quillInstanceRef.current) {
          onChange(quillInstanceRef.current.root.innerHTML);
        }
      });

      // Set initial value if provided
      if (value) {
        quillInstanceRef.current.root.innerHTML = value;
      }

      isInitializedRef.current = true;
    }
  }, []); // Empty dependency array - initialize only once

  // Update content when value prop changes (for edit mode)
  useEffect(() => {
    if (quillInstanceRef.current && value !== undefined && isInitializedRef.current) {
      const currentContent = quillInstanceRef.current.root.innerHTML;
      if (currentContent !== value) {
        quillInstanceRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  return (
    <div>
      <style jsx global>{`
        /* Optimized Editor Typography - matching blog post view */
        .ql-editor {
          font-size: 17px !important;
          line-height: 1.7 !important;
          padding: 1.5rem !important;
        }

        .ql-editor p {
          margin-bottom: 1em !important;
          line-height: 1.7 !important;
          font-size: 17px !important;
        }

        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3,
        .ql-editor h4,
        .ql-editor h5,
        .ql-editor h6 {
          margin-top: 1.5em !important;
          margin-bottom: 0.6em !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
        }

        .ql-editor h1 { font-size: 2em !important; }
        .ql-editor h2 { font-size: 1.625em !important; }
        .ql-editor h3 { font-size: 1.375em !important; }
        .ql-editor h4 { font-size: 1.25em !important; }
        .ql-editor h5 { font-size: 1.125em !important; }
        .ql-editor h6 { font-size: 1em !important; }

        .ql-editor ul,
        .ql-editor ol {
          padding-left: 1.5em !important;
          margin-bottom: 1em !important;
        }

        .ql-editor li {
          margin-bottom: 0.3em !important;
          line-height: 1.7 !important;
          font-size: 17px !important;
        }

        .ql-editor blockquote {
          margin: 1.25em 0 !important;
          padding-left: 1em !important;
          font-style: italic !important;
          border-left: 4px solid #3b82f6 !important;
        }

        /* Code blocks in editor */
        .ql-editor .ql-code-block-container {
          margin: 1.25em 0 !important;
          padding: 1.25em !important;
          border-radius: 6px !important;
          background: #1e293b !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
        }

        .ql-editor .ql-code-block {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
          font-size: 15px !important;
          color: #e2e8f0 !important;
          line-height: 1.6 !important;
        }

        /* Inline code */
        .ql-editor code {
          font-size: 0.9em !important;
          padding: 0.2em 0.4em !important;
          background-color: rgba(150, 150, 150, 0.1) !important;
          border-radius: 3px !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
        }

        /* Make images in editor responsive */
        .ql-editor img {
          max-width: 100% !important;
          height: auto !important;
        }

        /* Enhance blot formatter toolbar visibility and UX */
        .blot-formatter__toolbar {
          z-index: 1000 !important;
          background: white !important;
          border: 1px solid #ccc !important;
          border-radius: 4px !important;
          padding: 4px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }

        .blot-formatter__toolbar-button {
          cursor: pointer !important;
          padding: 4px 8px !important;
          border: none !important;
          background: transparent !important;
        }

        .blot-formatter__toolbar-button:hover {
          background: #f0f0f0 !important;
        }

        .blot-formatter__overlay {
          z-index: 999 !important;
        }

        /* Increase editor container height for better writing experience */
        .ql-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
      `}</style>
      <div ref={quillRef} style={{ height: '700px' }}></div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        💡 Tip: Click on an image to see resize handles and alignment toolbar above it. Drag corners to resize, click toolbar buttons to align. Supports JPG, PNG, GIF, WebP (max 5MB).
      </p>
    </div>
  );
};

export default RichTextEditor;
