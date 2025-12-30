'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAuth();

  return (
    <div className="container-custom py-16">
      <div className="text-center max-w-3xl mx-auto">
        {/* Hero Section */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to{' '}
          <span className="text-blue-600">NotepadX</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Your modern, intuitive note-taking companion. Capture ideas, organize thoughts, 
          and boost your productivity with our clean and powerful interface.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          {loading ? (
            <button disabled className="btn-disabled text-lg px-8 py-3">
              Loading...
            </button>
          ) : isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
              Go to Dashboard
            </Link>
          ) : (
            <button 
              disabled 
              className="btn-disabled text-lg px-8 py-3"
              title="Please sign in to access the dashboard"
            >
              Go to Dashboard
            </button>
          )}
        </div>

        {!loading && !isAuthenticated && (
          <p className="text-sm text-gray-500 mt-4">
            <Link href="/signin" className="text-blue-600 hover:text-blue-700 underline">
              Sign in
            </Link>{' '}
            to access your dashboard
          </p>
        )}

        {!loading && isAuthenticated && user && (
          <p className="text-sm text-gray-600 mt-4">
            Welcome back, {user.email}!
          </p>
        )}

        {/* Features Preview */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Notes</h3>
            <p className="text-gray-600">Capture ideas instantly with our fast and intuitive editor.</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize</h3>
            <p className="text-gray-600">Keep your notes structured with folders and tags.</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search</h3>
            <p className="text-gray-600">Find any note instantly with powerful search capabilities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}