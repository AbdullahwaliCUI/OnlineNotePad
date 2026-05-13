'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Plus, FileText, Key, Link2, FileWarning, Settings, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewItemDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleVaultOptionClick = (type: string) => {
    setIsOpen(false);
    router.push(`/dashboard?new=${encodeURIComponent(type)}`);
  };

  return (
    <div className="relative w-full md:w-auto z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-300 transform shadow-lg hover:shadow-xl text-center flex justify-center items-center gap-2 ${themeClasses.buttonPrimary} ${isOpen ? 'scale-95' : 'hover:-translate-y-0.5'}`}
      >
        <Plus size={20} />
        <span>New Item</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
          
          <div className="p-2 space-y-1">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notebook</h3>
            <Link
              href="/notes/new"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
              onClick={() => setIsOpen(false)}
            >
              <div className="p-1.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-md text-yellow-600 dark:text-yellow-500">
                <FileText size={16} />
              </div>
              Standard Note
            </Link>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-2 space-y-1">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              Secure Vault
            </h3>
            
            <button
              onClick={() => handleVaultOptionClick('Password')}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-500">
                <Key size={16} />
              </div>
              Password
            </button>

            <button
              onClick={() => handleVaultOptionClick('Link')}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-md text-green-600 dark:text-green-500">
                <Link2 size={16} />
              </div>
              Secure Link
            </button>

            <button
              onClick={() => handleVaultOptionClick('Note')}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-md text-yellow-600 dark:text-yellow-500">
                <FileWarning size={16} />
              </div>
              Secure Note
            </button>

            <button
              onClick={() => handleVaultOptionClick('API Key')}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-md text-purple-600 dark:text-purple-500">
                <Settings size={16} />
              </div>
              API Key
            </button>
            
            <button
              onClick={() => handleVaultOptionClick('General')}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
            >
              <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
                <Folder size={16} />
              </div>
              Other Item
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}
