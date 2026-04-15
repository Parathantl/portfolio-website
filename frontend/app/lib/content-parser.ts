/**
 * Server-side content parser for extracting structured data from HTML content.
 * Uses regex-based parsing (no DOM dependency) for SSR compatibility.
 */

/**
 * Strip all HTML tags from content.
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Calculate word count from HTML content.
 */
export function calculateWordCount(html: string): number {
  const text = stripHTML(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Convert word count to ISO 8601 duration for reading time.
 * Assumes 200 words per minute reading speed.
 */
export function wordCountToISO8601(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200);
  if (minutes < 60) {
    return `PT${minutes}M`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `PT${hours}H${remainingMinutes}M` : `PT${hours}H`;
}

/**
 * Extract FAQ question/answer pairs from HTML content.
 *
 * Strict quality rules:
 * - Questions MUST end with '?' (no exceptions — "What is X" without ? is a heading, not a question)
 * - Answers must be at least 50 characters (short answers aren't useful FAQ entries)
 * - Also extracts list content (<ul><li>, <ol><li>) following a question heading
 */
export function extractFAQFromHTML(
  html: string
): Array<{ question: string; answer: string }> {
  const pairs: Array<{ question: string; answer: string }> = [];

  // Pattern 1: Heading followed by content (paragraphs + lists)
  const headingPattern =
    /<h[2-4][^>]*>(.*?)<\/h[2-4]>\s*([\s\S]*?)(?=<h[2-4]|$)/gi;

  let match;
  while ((match = headingPattern.exec(html)) !== null) {
    const headingText = stripHTML(match[1]);
    const bodyHTML = match[2];

    // STRICT: Only accept headings that end with '?'
    if (!headingText.endsWith('?')) continue;
    if (!bodyHTML) continue;

    // Extract text from paragraphs AND list items
    const contentParts: string[] = [];

    // Get paragraphs
    const pPattern = /<p[^>]*>(.*?)<\/p>/gi;
    let pMatch;
    while ((pMatch = pPattern.exec(bodyHTML)) !== null) {
      const text = stripHTML(pMatch[1]);
      if (text) contentParts.push(text);
    }

    // Get list items (these often contain the actual answer content)
    const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liPattern.exec(bodyHTML)) !== null) {
      const text = stripHTML(liMatch[1]);
      if (text) contentParts.push(text);
    }

    // Fallback: get any text content if no p/li tags
    if (contentParts.length === 0) {
      const bodyText = stripHTML(bodyHTML);
      if (bodyText) contentParts.push(bodyText);
    }

    const answer = contentParts.join(' ').trim();

    // STRICT: Answer must be substantial (at least 50 chars)
    if (answer.length >= 50) {
      pairs.push({
        question: headingText,
        answer: answer,
      });
    }
  }

  // Pattern 2: Strong/bold question followed by answer
  if (pairs.length < 2) {
    const strongPattern =
      /<(?:strong|b)[^>]*>\s*(?:Q[:.]?\s*)?(.*?\?)\s*<\/(?:strong|b)>\s*(.*?)(?=<(?:strong|b)|<h[2-4]|$)/gi;

    while ((match = strongPattern.exec(html)) !== null) {
      const question = stripHTML(match[1]);
      const answer = stripHTML(match[2]);

      if (question && answer && answer.length >= 50) {
        pairs.push({ question, answer });
      }
    }
  }

  return pairs;
}

/**
 * Extract how-to steps from HTML content.
 *
 * Strict quality rules:
 * - Only extracts from "Step N:" headings (explicit instructional content)
 * - Does NOT extract from generic <ol><li> lists (too many false positives —
 *   lists of features, requirements, or concepts are not "steps")
 * - Each step must have a name AND substantive body text (at least 30 chars)
 * - Name and text must be different (identical name/text = low quality)
 */
export function extractHowToSteps(
  html: string
): Array<{ name: string; text: string }> {
  const steps: Array<{ name: string; text: string }> = [];

  // Match any h2-h4 heading followed by body content
  const headingPattern =
    /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>\s*([\s\S]*?)(?=<h[2-4]|$)/gi;

  let stepMatch;
  while ((stepMatch = headingPattern.exec(html)) !== null) {
    const headingHTML = stepMatch[1];
    const bodyHTML = stepMatch[2];

    // Strip inner HTML tags to get plain heading text, then check for "Step N:" pattern
    const headingText = stripHTML(headingHTML).trim();
    const stepPattern = /^step\s*\d+[:.]\s*(.*)/i;
    const stepNameMatch = headingText.match(stepPattern);
    if (!stepNameMatch) continue;

    const name = stepNameMatch[1].trim();

    // Extract text from paragraphs and list items
    const contentParts: string[] = [];
    const pPattern = /<p[^>]*>(.*?)<\/p>/gi;
    let pMatch;
    while ((pMatch = pPattern.exec(bodyHTML)) !== null) {
      const text = stripHTML(pMatch[1]);
      if (text) contentParts.push(text);
    }
    const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liPattern.exec(bodyHTML)) !== null) {
      const text = stripHTML(liMatch[1]);
      if (text) contentParts.push(text);
    }
    if (contentParts.length === 0) {
      const bodyText = stripHTML(bodyHTML);
      if (bodyText) contentParts.push(bodyText);
    }

    const text = contentParts.join(' ').trim().substring(0, 500);

    // STRICT: Name must exist, text must be substantial, and they must differ
    if (name && text && text.length >= 30 && text !== name) {
      steps.push({ name, text });
    }
  }

  return steps;
}

/**
 * Extract table of contents from HTML heading hierarchy.
 */
export function extractTableOfContents(
  html: string
): Array<{ level: number; text: string; id: string }> {
  const toc: Array<{ level: number; text: string; id: string }> = [];
  const headingPattern = /<h([2-4])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[2-4]>/gi;

  let match;
  while ((match = headingPattern.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = stripHTML(match[3]);
    const id =
      match[2] ||
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (text) {
      toc.push({ level, text, id });
    }
  }

  return toc;
}
