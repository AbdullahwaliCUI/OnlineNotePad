'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  getThemeClasses: () => {
    sidebar: string;
    sidebarBorder: string;
    sidebarText: string;
    sidebarActiveItem: string;
    sidebarInactiveItem: string;
    background: string;
    accent: string;
    accentHover: string;
    gradient: string;
    // New comprehensive theme colors
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryBorder: string;
    primaryText: string;
    buttonPrimary: string;
    buttonSecondary: string;
    inputFocus: string;
    cardBorder: string;
    iconColor: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('blue');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('notepadx-theme') as ThemeType;
    if (savedTheme && ['blue', 'green', 'purple', 'orange', 'pink', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('notepadx-theme', theme);
  }, [theme]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'blue':
        return {
          sidebar: 'bg-gradient-to-b from-blue-600 to-blue-800',
          sidebarBorder: 'border-blue-700',
          sidebarText: 'text-blue-100',
          sidebarActiveItem: 'bg-blue-700 text-white border-blue-600',
          sidebarInactiveItem: 'text-blue-200 hover:text-white hover:bg-blue-700',
          background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
          accent: 'bg-blue-600',
          accentHover: 'hover:bg-blue-700',
          gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          // Comprehensive theme colors
          primary: 'blue-600',
          primaryHover: 'blue-700',
          primaryLight: 'blue-50',
          primaryBorder: 'blue-200',
          primaryText: 'blue-900',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          buttonSecondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
          inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
          cardBorder: 'border-blue-200',
          iconColor: 'text-blue-600',
        };
      case 'green':
        return {
          sidebar: 'bg-gradient-to-b from-green-600 to-green-800',
          sidebarBorder: 'border-green-700',
          sidebarText: 'text-green-100',
          sidebarActiveItem: 'bg-green-700 text-white border-green-600',
          sidebarInactiveItem: 'text-green-200 hover:text-white hover:bg-green-700',
          background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
          accent: 'bg-green-600',
          accentHover: 'hover:bg-green-700',
          gradient: 'bg-gradient-to-r from-green-50 to-emerald-50',
          // Comprehensive theme colors
          primary: 'green-600',
          primaryHover: 'green-700',
          primaryLight: 'green-50',
          primaryBorder: 'green-200',
          primaryText: 'green-900',
          buttonPrimary: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
          buttonSecondary: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
          inputFocus: 'focus:ring-green-500 focus:border-green-500',
          cardBorder: 'border-green-200',
          iconColor: 'text-green-600',
        };
      case 'purple':
        return {
          sidebar: 'bg-gradient-to-b from-purple-600 to-purple-800',
          sidebarBorder: 'border-purple-700',
          sidebarText: 'text-purple-100',
          sidebarActiveItem: 'bg-purple-700 text-white border-purple-600',
          sidebarInactiveItem: 'text-purple-200 hover:text-white hover:bg-purple-700',
          background: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
          accent: 'bg-purple-600',
          accentHover: 'hover:bg-purple-700',
          gradient: 'bg-gradient-to-r from-purple-50 to-violet-50',
          // Comprehensive theme colors
          primary: 'purple-600',
          primaryHover: 'purple-700',
          primaryLight: 'purple-50',
          primaryBorder: 'purple-200',
          primaryText: 'purple-900',
          buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600',
          buttonSecondary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
          inputFocus: 'focus:ring-purple-500 focus:border-purple-500',
          cardBorder: 'border-purple-200',
          iconColor: 'text-purple-600',
        };
      case 'orange':
        return {
          sidebar: 'bg-gradient-to-b from-orange-600 to-orange-800',
          sidebarBorder: 'border-orange-700',
          sidebarText: 'text-orange-100',
          sidebarActiveItem: 'bg-orange-700 text-white border-orange-600',
          sidebarInactiveItem: 'text-orange-200 hover:text-white hover:bg-orange-700',
          background: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
          accent: 'bg-orange-600',
          accentHover: 'hover:bg-orange-700',
          gradient: 'bg-gradient-to-r from-orange-50 to-amber-50',
          // Comprehensive theme colors
          primary: 'orange-600',
          primaryHover: 'orange-700',
          primaryLight: 'orange-50',
          primaryBorder: 'orange-200',
          primaryText: 'orange-900',
          buttonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600',
          buttonSecondary: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
          inputFocus: 'focus:ring-orange-500 focus:border-orange-500',
          cardBorder: 'border-orange-200',
          iconColor: 'text-orange-600',
        };
      case 'pink':
        return {
          sidebar: 'bg-gradient-to-b from-pink-600 to-pink-800',
          sidebarBorder: 'border-pink-700',
          sidebarText: 'text-pink-100',
          sidebarActiveItem: 'bg-pink-700 text-white border-pink-600',
          sidebarInactiveItem: 'text-pink-200 hover:text-white hover:bg-pink-700',
          background: 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100',
          accent: 'bg-pink-600',
          accentHover: 'hover:bg-pink-700',
          gradient: 'bg-gradient-to-r from-pink-50 to-rose-50',
          // Comprehensive theme colors
          primary: 'pink-600',
          primaryHover: 'pink-700',
          primaryLight: 'pink-50',
          primaryBorder: 'pink-200',
          primaryText: 'pink-900',
          buttonPrimary: 'bg-pink-600 hover:bg-pink-700 text-white border-pink-600',
          buttonSecondary: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200',
          inputFocus: 'focus:ring-pink-500 focus:border-pink-500',
          cardBorder: 'border-pink-200',
          iconColor: 'text-pink-600',
        };
      case 'dark':
        return {
          sidebar: 'bg-gradient-to-b from-gray-800 to-gray-900',
          sidebarBorder: 'border-gray-700',
          sidebarText: 'text-gray-100',
          sidebarActiveItem: 'bg-gray-700 text-white border-gray-600',
          sidebarInactiveItem: 'text-gray-300 hover:text-white hover:bg-gray-700',
          background: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
          accent: 'bg-gray-700',
          accentHover: 'hover:bg-gray-600',
          gradient: 'bg-gradient-to-r from-gray-800 to-gray-700',
          // Comprehensive theme colors
          primary: 'gray-700',
          primaryHover: 'gray-600',
          primaryLight: 'gray-800',
          primaryBorder: 'gray-600',
          primaryText: 'gray-100',
          buttonPrimary: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-700',
          buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border-gray-600',
          inputFocus: 'focus:ring-gray-500 focus:border-gray-500',
          cardBorder: 'border-gray-600',
          iconColor: 'text-gray-400',
        };
      default:
        return {
          sidebar: 'bg-gradient-to-b from-blue-600 to-blue-800',
          sidebarBorder: 'border-blue-700',
          sidebarText: 'text-blue-100',
          sidebarActiveItem: 'bg-blue-700 text-white border-blue-600',
          sidebarInactiveItem: 'text-blue-200 hover:text-white hover:bg-blue-700',
          background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
          accent: 'bg-blue-600',
          accentHover: 'hover:bg-blue-700',
          gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          // Default blue theme
          primary: 'blue-600',
          primaryHover: 'blue-700',
          primaryLight: 'blue-50',
          primaryBorder: 'blue-200',
          primaryText: 'blue-900',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          buttonSecondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
          inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
          cardBorder: 'border-blue-200',
          iconColor: 'text-blue-600',
        };
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
};