import { z } from 'zod';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

// Helper function to validate E.164 phone format
const isValidE164 = (phone: string): boolean => {
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

// Helper function to strip HTML tags and get plain text
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((phone) => {
      try {
        return isValidPhoneNumber(phone);
      } catch {
        return false;
      }
    }, {
      message: 'Please enter a valid phone number',
    }),
});

// Profile validation schema
export const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  phoneE164: z
    .string()
    .optional()
    .refine((phone) => !phone || isValidE164(phone), {
      message: 'Phone number must be in valid E.164 format (e.g., +1234567890)',
    }),
  whatsappOptIn: z.boolean().default(false),
});

// Note validation schemas
export const noteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  content: z
    .string()
    .refine((content) => {
      const plainText = stripHtmlTags(content);
      return plainText.length > 0;
    }, {
      message: 'Content is required and cannot be empty',
    })
    .refine((content) => {
      return content.length <= 100000; // 100KB limit for HTML content
    }, {
      message: 'Content is too long (maximum 100,000 characters)',
    }),
  contentHtml: z.string().optional(),
  isPublic: z.boolean().default(false),
  isShared: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  folderId: z.string().uuid().optional().nullable(),
});

export const noteUpdateSchema = noteSchema.partial().extend({
  id: z.string().uuid(),
});

// Folder validation schema
export const folderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(50, 'Folder name must be less than 50 characters')
    .trim(),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').default('#3B82F6'),
  icon: z.string().max(20, 'Icon name must be less than 20 characters').default('folder'),
  parentId: z.string().uuid().optional().nullable(),
});

// Tag validation schema
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(30, 'Tag name must be less than 30 characters')
    .trim()
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').default('#6B7280'),
  description: z.string().max(100, 'Description must be less than 100 characters').optional(),
});

// Search and filter validation
export const searchSchema = z.object({
  query: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  folderId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  isPublic: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'word_count']).default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Helper function to convert phone to E.164 format
export const phoneToE164 = (phone: string, defaultCountry: string = 'US'): string | null => {
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry as any);
    return phoneNumber?.format('E.164') || null;
  } catch {
    return null;
  }
};

// Helper function to validate and format phone number
export const validateAndFormatPhone = (phone: string): { isValid: boolean; formatted: string | null; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: true, formatted: null };
  }

  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber && phoneNumber.isValid()) {
      return {
        isValid: true,
        formatted: phoneNumber.format('E.164'),
      };
    } else {
      return {
        isValid: false,
        formatted: null,
        error: 'Please enter a valid phone number',
      };
    }
  } catch (error) {
    return {
      isValid: false,
      formatted: null,
      error: 'Please enter a valid phone number',
    };
  }
};

// Content validation helpers
export const validateNoteContent = (content: string): { isValid: boolean; plainText: string; error?: string } => {
  const plainText = stripHtmlTags(content);
  
  if (plainText.length === 0) {
    return {
      isValid: false,
      plainText,
      error: 'Content cannot be empty',
    };
  }

  if (content.length > 100000) {
    return {
      isValid: false,
      plainText,
      error: 'Content is too long (maximum 100,000 characters)',
    };
  }

  return {
    isValid: true,
    plainText,
  };
};

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
export type NoteUpdateFormData = z.infer<typeof noteUpdateSchema>;
export type FolderFormData = z.infer<typeof folderSchema>;
export type TagFormData = z.infer<typeof tagSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;