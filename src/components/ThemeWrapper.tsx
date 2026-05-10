'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  useEffect(() => {
    // Apply theme background to body
    const body = document.body;
    const html = document.documentElement;
    
    // Remove all existing background classes
    body.className = body.className.replace(/bg-\S+/g, '');
    
    // Add theme background classes
    const backgroundClasses = themeClasses.background.split(' ');
    body.classList.add(...backgroundClasses);
    html.classList.add(...backgroundClasses);
    
    // Set min-height to ensure full coverage
    body.style.minHeight = '100vh';
    html.style.minHeight = '100vh';
    
    return () => {
      // Cleanup on unmount
      backgroundClasses.forEach(cls => {
        body.classList.remove(cls);
        html.classList.remove(cls);
      });
    };
  }, [themeClasses.background]);

  return <>{children}</>;
}