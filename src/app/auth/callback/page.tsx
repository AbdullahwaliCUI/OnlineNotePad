'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed');
          router.push('/auth/sign-in');
          return;
        }

        if (data.session) {
          toast.success('Email confirmed successfully!');
          router.push('/dashboard');
        } else {
          router.push('/auth/sign-in');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        toast.error('Something went wrong');
        router.push('/auth/sign-in');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="container-custom py-16">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your email...</p>
        </div>
      </div>
    </div>
  );
}