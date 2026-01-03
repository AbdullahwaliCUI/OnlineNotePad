'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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
    <div className={`bg-white shadow-sm border-r border-gray-200 h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className={`p-6 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            onClick={handleLinkClick}
          >
            📝 NotepadX
          </Link>
        ) : (
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
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
            className={`hidden lg:flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${!isCollapsed ? 'ml-auto' : ''}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
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
                className={`${isActive(item.href) ? 'sidebar-nav-item sidebar-nav-item-active' : 'sidebar-nav-item sidebar-nav-item-inactive'} ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3 transition-opacity duration-300 opacity-100">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" title={user?.email || 'User'}>
            <span className="text-blue-600 font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 ml-2"
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
            className="mt-4 w-full flex justify-center text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </div>
  );
}