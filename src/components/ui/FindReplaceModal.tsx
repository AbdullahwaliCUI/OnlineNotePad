import React, { useState, useEffect } from 'react';
import { X, Search, Replace, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (term: string) => void;
  onReplace: (replaceWith: string) => void;
  onReplaceAll: (replaceWith: string) => void;
  matchCount: number;
}

export default function FindReplaceModal({
  isOpen,
  onClose,
  onSearch,
  onReplace,
  onReplaceAll,
  matchCount
}: FindReplaceModalProps) {
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  useEffect(() => {
    if (isOpen) {
      onSearch(findTerm);
    } else {
      onSearch(''); // Clear search when closed
    }
  }, [findTerm, isOpen, onSearch]);

  if (!isOpen) return null;

  return (
    <div className={`fixed top-24 right-8 z-[100] w-80 rounded-lg shadow-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} p-4 animate-in fade-in slide-in-from-top-4`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-sm font-semibold flex items-center gap-2 ${themeClasses.primaryText}`}>
          <Search size={16} />
          Find and Replace
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Find..."
            value={findTerm}
            onChange={(e) => setFindTerm(e.target.value)}
            className={`w-full px-3 py-1.5 text-sm rounded border ${themeClasses.primaryBorder} ${themeClasses.cardBackground} focus:outline-none focus:ring-1 focus:ring-blue-500 pr-16`}
            autoFocus
          />
          <div className="absolute right-2 top-1.5 text-xs text-gray-400">
            {findTerm ? `${matchCount} found` : ''}
          </div>
        </div>

        <input
          type="text"
          placeholder="Replace with..."
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          className={`w-full px-3 py-1.5 text-sm rounded border ${themeClasses.primaryBorder} ${themeClasses.cardBackground} focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => onReplace(replaceTerm)}
            disabled={!findTerm || matchCount === 0}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Replace
          </button>
          <button
            onClick={() => onReplaceAll(replaceTerm)}
            disabled={!findTerm || matchCount === 0}
            className="flex-1 px-3 py-1.5 text-xs font-medium border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 transition-colors"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
