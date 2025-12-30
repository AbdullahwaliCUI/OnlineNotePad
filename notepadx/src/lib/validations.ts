import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string()
    .optional()
    .refine((phone) => !phone || isValidPhoneNumber(phone), {
      message: 'Please enter a valid phone number',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
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

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
export type NoteUpdateFormData = z.infer<typeof noteUpdateSchema>;