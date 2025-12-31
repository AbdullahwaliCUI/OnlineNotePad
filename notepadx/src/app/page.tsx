'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium animate-fade-in-up">
              🚀 The Ultimate Note-Taking Experience
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              Capture Ideas, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Unleash Creativity
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              NotepadX is your digital sanctuary for thoughts. clear, focused, and beautifully designed to keep you in flow state.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {loading ? (
                <button disabled className="btn-disabled text-lg px-8 py-4 rounded-xl">
                  Loading...
                </button>
              ) : isAuthenticated ? (
                <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    Get Started Free
                  </Link>
                  <Link href="#features" className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-lg font-semibold px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-3xl mix-blend-multiply filter opacity-20 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full blur-3xl mix-blend-multiply filter opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-[30%] h-[30%] bg-pink-400 rounded-full blur-3xl mix-blend-multiply filter opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why NotepadX?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to organize your life and work, without the clutter.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                title: "Instant Capture",
                desc: "Open and write. No friction, no loading times. Just you and your thoughts.",
                icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                color: "bg-blue-50"
              },
              {
                title: "Smart Organization",
                desc: "Tag, categorize, and find your notes instantly with our powerful search.",
                icon: (
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                color: "bg-purple-50"
              },
              {
                title: "Secure & Private",
                desc: "Your thoughts are yours alone. End-to-end encryption keeps your data safe.",
                icon: (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                color: "bg-green-50"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-gray-200/60 bg-white/40">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-4 md:mb-0">
              <span className="font-semibold text-gray-900">NotepadX</span> &copy; {new Date().getFullYear()}
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Twitter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}