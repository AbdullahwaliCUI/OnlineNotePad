import { z } from 'zod';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

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
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string()
    .optional()
    .refine((phone) => !phone || isValidPhoneNumber(phone), {
      message: 'Please enter a valid phone number',
    }),
});

// Note validation schemas
export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().max(50000, 'Content must be less than 50,000 characters'),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
});

export const noteUpdateSchema = noteSchema.partial();

// Helper function to convert phone to E.164 format
export const phoneToE164 = (phone: string, defaultCountry: string = 'US'): string | null => {
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry as any);
    return phoneNumber?.format('E.164') || null;
  } catch {
    return null;
  }
};

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
export type NoteUpdateFormData = z.infer<typeof noteUpdateSchema>;