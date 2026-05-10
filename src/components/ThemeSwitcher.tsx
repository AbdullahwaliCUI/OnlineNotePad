'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';
import { useState } from 'react';

export default function ThemeSwitcher() {
  const { theme, setTheme, getThemeClasses } = useTheme();
  const [showThemes, setShowThemes] = useState(false);
  const themeClasses = getThemeClasses();

  const themes = [
    {
      id: 'blue' as const,
      name: 'Ocean Blue',
      description: 'Blue to Dark Blue gradient',
      preview: 'bg-gradient-to-r from-blue-600 to-blue-800',
      icon: '🌊',
    },
    {
      id: 'green' as const,
      name: 'Forest Green',
      description: 'Green to Dark Green gradient',
      preview: 'bg-gradient-to-r from-green-600 to-green-800',
      icon: '🌲',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowThemes(!showThemes)}
        className={`p-2 rounded-md transition-colors ${themeClasses.sidebarInactiveItem}`}
        title="Change Theme"
      >
        <Palette size={20} />
      </button>

      {showThemes && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowThemes(false)}
          />
          
          {/* Theme Selector */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Theme</h3>
            
            <div className="space-y-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id);
                    setShowThemes(false);
                  }}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    theme === themeOption.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full ${themeOption.preview} flex items-center justify-center text-white text-sm`}>
                        {themeOption.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{themeOption.name}</span>
                        {theme === themeOption.id && (
                          <span className="text-blue-600 text-xs">✓ Active</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{themeOption.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Theme preference is saved automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}