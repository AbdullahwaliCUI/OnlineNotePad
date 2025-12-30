import DOMPurify from 'dompurify';
import { formatNumber, parsePhoneNumber } from 'libphonenumber-js';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Enhanced for React Quill content with link support
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized on client)
    return html;
  }
  
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'a', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'class', 'href', 'target', 'rel', 'style'
    ],
    ALLOW_DATA_ATTR: false
  });

  // Post-process to add security attributes to links
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    
    const links = tempDiv.querySelectorAll('a[href]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    return tempDiv.innerHTML;
  }
  
  return cleanHtml;
}

/**
 * Sanitize pasted content specifically for React Quill
 * Removes potentially dangerous elements while preserving formatting
 */
export function sanitizePastedContent(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }

  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a', 'span'
    ],
    ALLOWED_ATTR: ['href', 'class'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'img', 'video', 'audio'],
    FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror', 'src'],
    ALLOW_DATA_ATTR: false
  });

  // Post-process to add security attributes to links
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    
    const links = tempDiv.querySelectorAll('a[href]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    return tempDiv.innerHTML;
  }
  
  return cleanHtml;
}

/**
 * Format phone number for display
 */
export function formatPhone(phoneNumber: string, country: string = 'US'): string {
  try {
    return formatNumber(phoneNumber, country as any) || phoneNumber;
  } catch {
    return phoneNumber;
  }
}

/**
 * Parse and format phone number to E.164 format
 */
export function parsePhoneToE164(phoneNumber: string, country: string = 'US'): string | null {
  try {
    const parsed = parsePhoneNumber(phoneNumber, country as any);
    return parsed?.format('E.164') || null;
  } catch {
    return null;
  }
}

/**
 * Convert HTML content back to simple text format for editing
 */
export function htmlToSimpleText(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p><p>/g, '\n\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<ul><li>(.*?)<\/li><\/ul>/g, '• $1')
    .replace(/<ol><li>(.*?)<\/li><\/ol>/g, '1. $1')
    .replace(/<li>(.*?)<\/li>/g, '• $1')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '')
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
    .trim();
}

/**
 * Strip HTML tags and get plain text
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}