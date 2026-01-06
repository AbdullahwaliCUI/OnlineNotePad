'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    if (mounted) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebarOpen, mounted]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (mounted) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [sidebarOpen, mounted]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-white shadow-sm border-r border-gray-200"></div>
        <div className="flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${themeClasses.background} min-h-screen`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div
        id="sidebar"
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out flex-shrink-0`}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${themeClasses.background}`}>
        {/* Mobile header with hamburger menu */}
        <div className={`lg:hidden shadow-sm border-b px-4 py-3 ${themeClasses.cardBackground} ${themeClasses.cardBorder}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-md transition-colors ${themeClasses.iconColor} hover:bg-white/20`}
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className={`text-lg font-semibold ${themeClasses.primaryText}`}>📝 NotepadX</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page content with modern header and cards */}
        <main className={`flex-1 overflow-y-auto ${themeClasses.background}`}>
          <div className="container-custom py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}