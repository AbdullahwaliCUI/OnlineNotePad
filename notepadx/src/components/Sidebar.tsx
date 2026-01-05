'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  
  // Add error handling for theme context
  let themeClasses;
  let setTheme;
  try {
    const themeContext = useTheme();
    themeClasses = themeContext.getThemeClasses();
    setTheme = themeContext.setTheme;
  } catch (error) {
    console.error('Theme context error:', error);
    // Fallback to blue theme
    themeClasses = {
      sidebar: 'bg-gradient-to-b from-blue-600 to-blue-800',
      sidebarBorder: 'border-blue-700',
      sidebarText: 'text-blue-100',
      sidebarActiveItem: 'bg-blue-700 text-white border-blue-600',
      sidebarInactiveItem: 'text-blue-200 hover:text-white hover:bg-blue-700',
      background: 'bg-gray-50',
      accent: 'bg-blue-600',
      accentHover: 'hover:bg-blue-700',
      gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    };
    setTheme = () => {}; // No-op fallback
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
    },
    {
      name: 'All Notes',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'New Note',
      href: '/notes/new',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: 'Favorites',
      href: '/dashboard?filter=pinned',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      name: 'Archive',
      href: '/dashboard?filter=archived',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' && (typeof window === 'undefined' || !window.location.search);
    }
    return pathname === href || pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`${themeClasses.sidebar} shadow-sm border-r ${themeClasses.sidebarBorder} h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className={`p-6 border-b ${themeClasses.sidebarBorder} flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <Link
            href="/"
            className={`text-xl font-bold text-white hover:text-opacity-80 transition-colors`}
            onClick={handleLinkClick}
          >
            📝 NotepadX
          </Link>
        ) : (
          <Link
            href="/"
            className={`text-xl font-bold text-white hover:text-opacity-80 transition-colors`}
            onClick={handleLinkClick}
            title="NotepadX"
          >
            📝
          </Link>
        )}

        {/* Desktop Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center p-1 rounded-md ${themeClasses.sidebarInactiveItem} ${!isCollapsed ? 'ml-auto' : ''}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className={`lg:hidden p-1 rounded-md ${themeClasses.sidebarInactiveItem}`}
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4" aria-label="Main navigation">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={handleLinkClick}
                title={isCollapsed ? item.name : ''}
                className={`${isActive(item.href) ? `${themeClasses.sidebarActiveItem} sidebar-nav-item sidebar-nav-item-active` : `${themeClasses.sidebarInactiveItem} sidebar-nav-item sidebar-nav-item-inactive`} ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3 transition-opacity duration-300 opacity-100">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme Switcher */}
      {!isCollapsed && (
        <div className={`px-4 pb-2 border-b ${themeClasses.sidebarBorder}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${themeClasses.sidebarText}`}>Theme</span>
            <div className="flex gap-1">
              {/* Blue Theme Button */}
              <button
                onClick={() => setTheme('blue')}
                className="w-6 h-6 rounded bg-gradient-to-r from-blue-600 to-blue-800 border-2 border-white hover:scale-110 transition-transform"
                title="Ocean Blue Theme"
              >
                🌊
              </button>
              {/* Green Theme Button */}
              <button
                onClick={() => setTheme('green')}
                className="w-6 h-6 rounded bg-gradient-to-r from-green-600 to-green-800 border-2 border-white hover:scale-110 transition-transform"
                title="Forest Green Theme"
              >
                🌲
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className={`p-4 border-t ${themeClasses.sidebarBorder} ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0" title={user?.email || 'User'}>
            <span className="text-white font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user?.email}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className={`p-1 rounded-md ml-2 ${themeClasses.sidebarInactiveItem}`}
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
        {/* Sign out button for collapsed state */}
        {isCollapsed && (
          <button
            onClick={handleSignOut}
            className={`mt-4 w-full flex justify-center p-1 rounded-md ${themeClasses.sidebarInactiveItem}`}
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </div>
  );
}