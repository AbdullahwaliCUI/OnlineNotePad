import { supabase } from './supabaseClient';
import { phoneToE164 } from './validations';
import type { SignInFormData, SignUpFormData } from './validations';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}

export const authService = {
  async signUp(data: SignUpFormData): Promise<AuthResponse> {
    try {
      // Convert phone to E.164 format
      const phoneE164 = phoneToE164(data.phone);
      if (!phoneE164) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Split full name into first and last name
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.fullName,
            first_name: firstName,
            last_name: lastName,
            phone: phoneE164,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: authError.message,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create user account',
        };
      }

      // The profile will be created automatically by the database trigger
      // But let's also manually ensure it exists with the correct data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: data.email,
          first_name: firstName,
          last_name: lastName,
          phone: phoneE164,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the signup if profile creation fails, as the trigger should handle it
      }

      return {
        success: true,
        user: authData.user,
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during signup',
      };
    }
  },

  async signIn(data: SignInFormData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return {
          success: false,
          error: authError.message,
        };
      }

      return {
        success: true,
        user: authData.user,
      };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during signin',
      };
    }
  },

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Signout error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during signout',
      };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  },
};