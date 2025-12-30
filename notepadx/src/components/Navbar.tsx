'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      toast.success('Signed out successfully!');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              NotepadX
            </Link>
          </div>

          {/* Auth Area */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/sign-in" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/sign-up" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}