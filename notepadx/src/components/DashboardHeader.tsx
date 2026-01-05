'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardHeaderProps {
  totalNotes: number;
  totalWords: number;
  totalReadingTime: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function DashboardHeader({
  totalNotes,
  totalWords,
  totalReadingTime,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const userName = user?.email?.split('@')[0] || 'User';

  return (
    <div className="mb-8">
      {/* Welcome & New Note - Flex container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-foreground">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Hi, {userName} <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your ideas and creative work.
          </p>
        </div>

        <Link
          href="/notes/new"
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl ${themeClasses.buttonPrimary}`}
        >
          + New Note
        </Link>
      </div>

      {/* Stats - Compact & Blended */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className={`${themeClasses.statsBackground} border ${themeClasses.cardBorder} rounded-xl p-4 ${themeClasses.shadowColor} shadow-lg transition-all duration-300 ${themeClasses.glowEffect}`}>
          <p className="text-sm font-medium text-gray-600 mb-1">Notes</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${themeClasses.primaryText}`}>{totalNotes}</span>
            <span className="text-xs text-gray-500">total</span>
          </div>
        </div>

        <div className={`${themeClasses.statsBackground} border ${themeClasses.cardBorder} rounded-xl p-4 ${themeClasses.shadowColor} shadow-lg transition-all duration-300 ${themeClasses.glowEffect}`}>
          <p className="text-sm font-medium text-gray-600 mb-1">Words</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${themeClasses.primaryText}`}>{totalWords.toLocaleString()}</span>
            <span className="text-xs text-gray-500">written</span>
          </div>
        </div>

        <div className={`col-span-2 md:col-span-1 ${themeClasses.statsBackground} border ${themeClasses.cardBorder} rounded-xl p-4 ${themeClasses.shadowColor} shadow-lg transition-all duration-300 ${themeClasses.glowEffect}`}>
          <p className="text-sm font-medium text-gray-600 mb-1">Reading Time</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${themeClasses.primaryText}`}>{totalReadingTime}</span>
            <span className="text-xs text-gray-500">mins</span>
          </div>
        </div>
      </div>

      {/* Search Bar & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
            <svg className={`h-5 w-5 text-gray-400 group-focus-within:${themeClasses.iconColor} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className={`block w-full pl-10 pr-3 py-2.5 ${themeClasses.searchBackground} border rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm ${themeClasses.inputFocus} ${themeClasses.cardBorder}`}
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-border shrink-0 shadow-sm">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            aria-label="Grid view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            aria-label="List view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}