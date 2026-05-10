import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side sanitization
    const jsdom = require('jsdom');
    const { JSDOM } = jsdom;
    const window = new JSDOM('').window;
    const createDOMPurify = require('dompurify');
    const purify = createDOMPurify(window);
    return purify.sanitize(html);
  }
  // Client-side sanitization
  return DOMPurify.sanitize(html);
};

export const htmlToSimpleText = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};