'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  BookOpen, FolderKanban, Library, FlaskConical, 
  Map, FileBox, StickyNote, Bell, Beaker
} from 'lucide-react';

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const tabs = [
    { name: 'Overview', href: '/dashboard/research', icon: <BookOpen size={16} /> },
    { name: 'Projects', href: '/dashboard/research/projects', icon: <FolderKanban size={16} /> },
    { name: 'Literature', href: '/dashboard/research/literature', icon: <Library size={16} /> },
    { name: 'Experiments', href: '/dashboard/research/experiments', icon: <FlaskConical size={16} /> },
    { name: 'Paper Mapping', href: '/dashboard/research/paper-mapping', icon: <Map size={16} /> },
    { name: 'Assets', href: '/dashboard/research/assets', icon: <FileBox size={16} /> },
    { name: 'Notes', href: '/dashboard/research/notes', icon: <StickyNote size={16} /> },
    { name: 'Reminders', href: '/dashboard/research/reminders', icon: <Bell size={16} /> },
  ];

  return (
    <div className={`min-h-full pb-10 ${themeClasses.background}`}>
      <div className={`p-6 rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm mb-6`}>
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Beaker size={14} /> RESEARCH MODULE
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${themeClasses.primaryText}`}>
              Research Repository Workspace
            </h1>
            <p className={`${themeClasses.primaryText} opacity-70 text-sm sm:text-base max-w-3xl`}>
              Projects, literature, experiments, paper section mapping, assets, notes, aur reminders ek connected research repository me.
            </p>
          </div>
          
          <div className="shrink-0 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="text-xs text-gray-400 tracking-wider uppercase mb-2">CURRENT SCOPE</div>
            <div className={`font-medium ${themeClasses.primaryText} mb-1`}>All research projects</div>
            <div className="text-sm text-gray-500">
              0 projects | 0 papers | 0 experiments | 0 sections
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#0a4531] text-white shadow-sm' 
                    : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            );
          })}
        </div>
        
      </div>

      {/* Main Content Area */}
      <div>
        {children}
      </div>
      
    </div>
  );
}
