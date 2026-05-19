'use client';

import { useEffect, useRef, useState } from 'react';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

interface MarkdownEditorProps {
  value?: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
  // Returns the uploaded image URL. When provided, the toolbar image
  // button, drag-drop, and clipboard-paste will upload via this callback.
  onImageUpload?: (file: File) => Promise<string>;
}

export default function MarkdownEditor({
  value = '',
  onChange,
  height = 500,
  placeholder = 'Write your post in Markdown...',
  onImageUpload,
}: MarkdownEditorProps) {
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.setAttribute(
      'data-color-mode',
      isDark ? 'dark' : 'light',
    );
  }, []);

  // Insert markdown image at the current cursor position by appending to value.
  const insertImageMarkdown = (url: string, altText: string) => {
    const snippet = `\n![${altText}](${url})\n`;
    onChange((value ?? '') + snippet);
  };

  const handleFiles = async (files: FileList | File[] | null | undefined) => {
    if (!onImageUpload || !files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;
    setUploading(true);
    try {
      for (const file of images) {
        const url = await onImageUpload(file);
        const altText = file.name.replace(/\.[^.]+$/, '');
        insertImageMarkdown(url, altText);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // Heading commands (custom — avoids the library's deprecated `title1`/`title2` exports).
  const headingCommand = (level: 1 | 2 | 3 | 4): ICommand => ({
    name: `heading-${level}`,
    keyCommand: `heading-${level}`,
    buttonProps: { 'aria-label': `Heading ${level}`, title: `Heading ${level}` },
    icon: (
      <span style={{ fontWeight: 600, fontSize: 12 }}>H{level}</span>
    ),
    execute: (state, api) => {
      const prefix = '#'.repeat(level);
      const selected = state.selectedText || `Heading ${level}`;
      api.replaceSelection(`${prefix} ${selected}`);
    },
  });

  // Table command: inserts a starter table.
  const tableCommand: ICommand = {
    name: 'table',
    keyCommand: 'table',
    buttonProps: { 'aria-label': 'Insert table', title: 'Insert table' },
    icon: (
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="1.5" y="3" width="13" height="10" rx="0.5" />
        <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" />
        <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
        <line x1="5.5" y1="3" x2="5.5" y2="13" />
        <line x1="10.5" y1="3" x2="10.5" y2="13" />
      </svg>
    ),
    execute: (_state, api) => {
      api.replaceSelection(
        '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n',
      );
    },
  };

  // Custom toolbar command: file picker → upload → insert markdown.
  const uploadImageCommand: ICommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Upload image', title: 'Upload image' },
    icon: (
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M14.5 2h-13A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zM1.5 3h13a.5.5 0 0 1 .5.5V10l-3-3-3 3-2-2L1 11V3.5a.5.5 0 0 1 .5-.5zM5 6.5A1.5 1.5 0 1 1 6.5 5 1.5 1.5 0 0 1 5 6.5z" />
      </svg>
    ),
    execute: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = () => handleFiles(input.files);
      input.click();
    },
  };

  // Drag-and-drop on the editor container.
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onImageUpload) return;
    if (
      e.dataTransfer?.files &&
      Array.from(e.dataTransfer.files).some((f) => f.type.startsWith('image/'))
    ) {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    }
  };

  // Paste-from-clipboard (screenshots).
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!onImageUpload) return;
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (imageFiles.length > 0) {
        e.preventDefault();
        handleFiles(imageFiles);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      data-color-mode="light"
      onDrop={onDrop}
      onDragOver={(e) => onImageUpload && e.preventDefault()}
      onPaste={onPaste}
      className="relative"
    >
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        textareaProps={{ placeholder }}
        commands={[
          headingCommand(1),
          headingCommand(2),
          headingCommand(3),
          commands.divider,
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          commands.codeBlock,
          onImageUpload ? uploadImageCommand : commands.image,
          tableCommand,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
          commands.divider,
          commands.hr,
        ]}
        extraCommands={[
          commands.codeEdit,
          commands.codeLive,
          commands.codePreview,
          commands.divider,
          commands.fullscreen,
        ]}
      />
      {uploading && (
        <div className="absolute inset-x-0 top-0 bg-blue-600 text-white text-sm px-3 py-1 text-center pointer-events-none">
          Uploading image…
        </div>
      )}
    </div>
  );
}
