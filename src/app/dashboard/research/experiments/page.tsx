'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { researchService } from '@/lib/research';
import type { ResearchExperiment, ResearchProject } from '@/types/database';
import AddExperimentModal from '@/components/research/AddExperimentModal';
import { Plus, Beaker, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExperimentsPage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [experiments, setExperiments] = useState<ResearchExperiment[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResearchExperiment | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [expData, projectsData] = await Promise.all([
        researchService.getExperiments(user.id),
        researchService.getProjects(user.id)
      ]);
      setExperiments(expData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExperiment = async (itemData: { title: string; status?: string; results?: string; project_id?: string }) => {
    if (!user) return;
    try {
      if (editingItem) {
        await researchService.updateExperiment(editingItem.id, user.id, itemData);
        toast.success('Experiment updated');
      } else {
        await researchService.createExperiment(user.id, itemData);
        toast.success('Experiment added');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this experiment?')) return;
    
    const success = await researchService.deleteExperiment(id, user.id);
    if (success) {
      toast.success('Experiment deleted');
      setExperiments(experiments.filter(e => e.id !== id));
    } else {
      toast.error('Failed to delete experiment');
    }
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'General';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'; // planned
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold ${themeClasses.primaryText}`}>Experiments Log</h2>
          <p className="text-gray-500 text-sm">Track your research experiments, methodology, and results.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a4531] hover:bg-[#073123] text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> New Experiment
        </button>
      </div>

      {/* Experiments Grid */}
      {experiments.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border border-dashed ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
            <Beaker size={32} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.primaryText}`}>No experiments logged</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start logging your experimental setups, metrics, and outcomes.</p>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} /> Log Experiment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map(item => (
            <div key={item.id} className={`flex flex-col p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border truncate max-w-[150px] ${getStatusColor(item.status)}`}>
                  {formatStatus(item.status)}
                </span>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${themeClasses.primaryText}`}>
                {item.title}
              </h3>
              
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Project: {getProjectName(item.project_id)}
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 whitespace-pre-wrap">
                {item.results || 'No results recorded yet.'}
              </p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                Updated: {new Date(item.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExperimentModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveExperiment}
        initialData={editingItem}
        projects={projects}
      />
    </div>
  );
}
