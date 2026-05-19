import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export { stripMarkdown } from './strip-markdown';

marked.setOptions({
  gfm: true,
  breaks: false,
});

// Server helper: parse Markdown → HTML, then sanitize for safe rendering.
// Synchronous when async:false is passed.
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml);
}
