'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function RemindersPage() {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className={`p-8 rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm text-center min-h-[400px] flex flex-col items-center justify-center animate-in fade-in duration-500`}>
      <h2 className={`text-xl font-bold mb-2 ${themeClasses.primaryText}`}>Reminders & Deadlines</h2>
      <p className="text-gray-500">Keep track of submission deadlines, meetings, and project milestones. (Coming Soon)</p>
    </div>
  );
}
