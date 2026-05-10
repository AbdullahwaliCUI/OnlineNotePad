'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import PhoneInput from '@/components/ui/PhoneInput';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/lib/database';
import { profileSchema, validateAndFormatPhone } from '@/lib/validations';
import { z } from 'zod';
import type { Profile } from '@/types/database';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phoneE164, setPhoneE164] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phoneE164?: string }>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const profileData = await profileService.getProfile(user.id);
      
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setPhoneE164(profileData.phone_e164 || '');
        setWhatsappOptIn(profileData.whatsapp_opt_in || false);
        setEmail(profileData.email || user.email || '');
      } else {
        setError('Profile not found');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneE164(value || '');
  };

  const validateForm = (): boolean => {
    try {
      // Validate using Zod schema
      profileSchema.parse({
        fullName: fullName.trim(),
        phoneE164: phoneE164 || undefined,
        whatsappOptIn: whatsappOptIn,
      });

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { fullName?: string; phoneE164?: string } = {};
        error.issues.forEach((err: any) => {
          if (err.path[0] === 'fullName') {
            fieldErrors.fullName = err.message;
          } else if (err.path[0] === 'phoneE164') {
            fieldErrors.phoneE164 = err.message;
          }
        });
        setErrors(fieldErrors);
        
        // Show the first error as toast
        const firstError = error.issues[0];
        toast.error(firstError.message);
        return false;
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!user || !profile) {
      toast.error('You must be signed in to update your profile');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Format phone number to E.164 if provided
      let formattedPhone: string | null = phoneE164;
      if (phoneE164) {
        const phoneValidation = validateAndFormatPhone(phoneE164);
        if (!phoneValidation.isValid) {
          toast.error(phoneValidation.error || 'Invalid phone number');
          return;
        }
        formattedPhone = phoneValidation.formatted;
      }

      const updates = {
        full_name: fullName.trim(),
        phone_e164: formattedPhone || null,
        whatsapp_opt_in: whatsappOptIn,
      };

      console.log('Attempting to update profile with:', updates);

      const updatedProfile = await profileService.updateProfile(user.id, updates);

      if (updatedProfile) {
        setProfile(updatedProfile);
        setPhoneE164(updatedProfile.phone_e164 || '');
        toast.success('Profile updated successfully!');
      } else {
        console.error('Profile update returned null');
        toast.error('Failed to update profile. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhoneE164(profile.phone_e164 || '');
      setWhatsappOptIn(profile.whatsapp_opt_in || false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container-custom py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading profile...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Profile not found'}
            </h1>
            <Link href="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="btn-secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-2xl">
          {/* Profile Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  value={phoneE164}
                  onChange={handlePhoneChange}
                  placeholder="Enter your phone number"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number will be stored in E.164 format (e.g., +1234567890)
                </p>
              </div>

              {/* WhatsApp Opt-in */}
              <div>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="whatsappOptIn"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={saving}
                  />
                  <div>
                    <label htmlFor="whatsappOptIn" className="text-sm font-medium text-gray-700">
                      WhatsApp Notifications
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Allow us to send you notifications via WhatsApp about your notes and account updates.
                      You can opt out at any time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !fullName.trim()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    saving || !fullName.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Profile Information</h3>
            <div className="text-blue-800 text-sm space-y-1">
              <div>Account created: {new Date(profile.created_at).toLocaleDateString()}</div>
              <div>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</div>
              <div>User ID: {profile.id}</div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Privacy & Security</h3>
            <div className="text-gray-700 text-sm space-y-2">
              <p>
                • Your personal information is encrypted and stored securely
              </p>
              <p>
                • Phone numbers are validated and stored in international E.164 format
              </p>
              <p>
                • WhatsApp notifications require your explicit consent and can be disabled anytime
              </p>
              <p>
                • We never share your personal information with third parties without your consent
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}