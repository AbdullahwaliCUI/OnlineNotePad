'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { researchService } from '@/lib/research';
import type { ResearchLiterature, ResearchProject } from '@/types/database';
import AddLiteratureModal from '@/components/research/AddLiteratureModal';
import { Plus, BookOpen, MoreVertical, Edit3, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiteraturePage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [literature, setLiterature] = useState<ResearchLiterature[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResearchLiterature | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [litData, projectsData] = await Promise.all([
        researchService.getLiterature(user.id),
        researchService.getProjects(user.id)
      ]);
      setLiterature(litData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Failed to load literature');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLiterature = async (itemData: { title: string; authors?: string; url?: string; notes?: string; project_id?: string }) => {
    if (!user) return;
    try {
      if (editingItem) {
        await researchService.updateLiterature(editingItem.id, user.id, itemData);
        toast.success('Literature updated');
      } else {
        await researchService.createLiterature(user.id, itemData);
        toast.success('Literature added');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to remove this paper from your library?')) return;
    
    const success = await researchService.deleteLiterature(id, user.id);
    if (success) {
      toast.success('Literature removed');
      setLiterature(literature.filter(l => l.id !== id));
    } else {
      toast.error('Failed to remove literature');
    }
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'General';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold ${themeClasses.primaryText}`}>Literature Repository</h2>
          <p className="text-gray-500 text-sm">Track papers, articles, and references for your research.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a4531] hover:bg-[#073123] text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> Add Literature
        </button>
      </div>

      {/* Literature Grid */}
      {literature.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border border-dashed ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
            <BookOpen size={32} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.primaryText}`}>No literature added</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Build your reading list by adding papers, authors, and links.</p>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} /> Add Paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {literature.map(item => (
            <div key={item.id} className={`flex flex-col p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 truncate max-w-[150px]`}>
                  {getProjectName(item.project_id)}
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
              
              <h3 className={`text-lg font-semibold mb-1 line-clamp-2 ${themeClasses.primaryText}`}>
                {item.title}
              </h3>
              
              {item.authors && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-1 italic">
                  {item.authors}
                </p>
              )}
              
              <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                {item.notes || 'No notes added.'}
              </p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
                <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View Source <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddLiteratureModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveLiterature}
        initialData={editingItem}
        projects={projects}
      />
    </div>
  );
}
