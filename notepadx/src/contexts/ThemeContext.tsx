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
        };
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
};