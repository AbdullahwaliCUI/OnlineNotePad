'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'blue' | 'green';

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
    if (savedTheme && (savedTheme === 'blue' || savedTheme === 'green')) {
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
          background: 'bg-gray-50',
          accent: 'bg-blue-600',
          accentHover: 'hover:bg-blue-700',
          gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          // New comprehensive theme colors
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
          background: 'bg-gray-50',
          accent: 'bg-green-600',
          accentHover: 'hover:bg-green-700',
          gradient: 'bg-gradient-to-r from-green-50 to-emerald-50',
          // New comprehensive theme colors
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
      default:
        return {
          sidebar: 'bg-gradient-to-b from-blue-600 to-blue-800',
          sidebarBorder: 'border-blue-700',
          sidebarText: 'text-blue-100',
          sidebarActiveItem: 'bg-blue-700 text-white border-blue-600',
          sidebarInactiveItem: 'text-blue-200 hover:text-white hover:bg-blue-700',
          background: 'bg-gray-50',
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