'use client';

import type { Metadata } from 'next';
import { useAuth } from '@/hooks/useAuth';
import HeroSlider from '@/components/landing/HeroSlider';
import StatsSection from '@/components/landing/StatsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import Footer from '@/components/landing/Footer';

// Note: Metadata export is not supported in client components
// This would need to be moved to a layout.tsx or separate metadata file
const pageMetadata = {
  title: 'NotepadX - Transform Your Ideas Into Action | Voice-Powered Note Taking',
  description: 'The most powerful note-taking app for modern professionals. Voice input in multiple languages, beautiful themes, real-time collaboration, and seamless sharing. Start free today!',
};

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  // If user is authenticated, show a simple redirect message
  if (isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome back!</h1>
          <p className="text-gray-600 mb-8">You're already signed in. Ready to continue?</p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Go to Dashboard
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NotepadX",
            "description": "Voice-powered note taking app with multilingual support, beautiful themes, and real-time collaboration features.",
            "url": "https://notepadx.vercel.app",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free to use with premium features available"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "15000",
              "bestRating": "5",
              "worstRating": "1"
            },
            "features": [
              "Voice input in multiple languages",
              "Rich text editor",
              "Real-time collaboration",
              "WhatsApp sharing",
              "Beautiful themes",
              "Note organization and pinning",
              "Cross-platform synchronization"
            ],
            "screenshot": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            "author": {
              "@type": "Organization",
              "name": "NotepadX Team"
            },
            "datePublished": "2024-01-01",
            "dateModified": new Date().toISOString().split('T')[0]
          })
        }}
      />
      
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}