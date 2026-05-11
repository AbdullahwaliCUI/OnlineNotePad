'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function PaperMappingPage() {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className={`p-8 rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm text-center min-h-[400px] flex flex-col items-center justify-center animate-in fade-in duration-500`}>
      <h2 className={`text-xl font-bold mb-2 ${themeClasses.primaryText}`}>Paper Section Mapping</h2>
      <p className="text-gray-500">Outline and draft sections of your research papers structurally. (Coming Soon)</p>
    </div>
  );
}
