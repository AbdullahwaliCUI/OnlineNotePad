import DOMPurify from 'dompurify';
import { formatPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized on client)
    return html;
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Format phone number for display
 */
export function formatPhone(phoneNumber: string, country: string = 'US'): string {
  try {
    return formatPhoneNumber(phoneNumber, country as any) || phoneNumber;
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