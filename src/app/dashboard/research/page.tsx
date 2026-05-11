'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ResearchOverviewPage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [stats, setStats] = useState({
    activeProjects: 0,
    literatureItems: 0,
    experiments: 0,
    paperSections: 0,
    dueToday: 0,
    overdue: 0
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    // In a real application, you would run count queries against each table
    // For now, we'll run simple selects to get the count since the tables might be empty
    try {
      const [projectsRes, literatureRes, experimentsRes, sectionsRes, remindersRes] = await Promise.all([
        supabase.from('research_projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        supabase.from('research_literature').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('research_experiments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('research_sections').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('research_reminders').select('id, due_date, is_completed').eq('user_id', user.id).eq('is_completed', false)
      ]);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let dueToday = 0;
      let overdue = 0;

      if (remindersRes.data) {
        remindersRes.data.forEach(r => {
          if (r.due_date) {
            const dueDate = new Date(r.due_date);
            const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            
            if (dueDay.getTime() === today.getTime()) dueToday++;
            if (dueDay.getTime() < today.getTime()) overdue++;
          }
        });
      }

      setStats({
        activeProjects: projectsRes.count || 0,
        literatureItems: literatureRes.count || 0,
        experiments: experimentsRes.count || 0,
        paperSections: sectionsRes.count || 0,
        dueToday,
        overdue
      });
    } catch (e) {
      console.error('Failed to fetch research stats', e);
    }
  };

  const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className={`p-6 rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm`}>
      <div className="text-xs text-gray-400 tracking-wider uppercase mb-2 font-medium">{label}</div>
      <div className={`text-3xl font-semibold ${themeClasses.primaryText}`}>{value}</div>
    </div>
  );

  const WidgetCard = ({ title, emptyMessage }: { title: string, emptyMessage: string }) => (
    <div className={`p-6 rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm min-h-[160px] flex flex-col`}>
      <h3 className={`font-semibold mb-4 ${themeClasses.primaryText}`}>{title}</h3>
      <div className="flex-1 flex items-center justify-start">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search papers, experiments, scripts, notes, reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 outline-none shadow-sm ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
          />
        </div>
        
        <div className="flex gap-2">
          <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-sm ${themeClasses.cardBorder} ${themeClasses.cardBackground} ${themeClasses.primaryText} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap`}>
            All Projects <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-sm ${themeClasses.cardBorder} ${themeClasses.cardBackground} ${themeClasses.primaryText} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap`}>
            All <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="ACTIVE PROJECTS" value={stats.activeProjects} />
        <StatCard label="LITERATURE ITEMS" value={stats.literatureItems} />
        <StatCard label="EXPERIMENTS" value={stats.experiments} />
        <StatCard label="PAPER SECTIONS" value={stats.paperSections} />
        <StatCard label="DUE TODAY" value={stats.dueToday} />
        <StatCard label="OVERDUE" value={stats.overdue} />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WidgetCard title="Latest Literature" emptyMessage="No literature saved yet." />
        <WidgetCard title="Experiment Tracker" emptyMessage="No experiments logged yet." />
        <WidgetCard title="Paper Section Mapping" emptyMessage="No paper sections mapped yet." />
        <WidgetCard title="Notification Log" emptyMessage="No reminder logs yet." />
      </div>
      
    </div>
  );
}
