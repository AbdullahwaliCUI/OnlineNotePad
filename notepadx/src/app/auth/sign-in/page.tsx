'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { signInSchema, type SignInFormData } from '@/lib/validations';
import { authService } from '@/lib/auth';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      const result = await authService.signIn(data);

      if (result.success) {
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Failed to sign in');
      }
    } catch (error) {
      console.error('Signin error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-custom py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your NotepadX account</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}