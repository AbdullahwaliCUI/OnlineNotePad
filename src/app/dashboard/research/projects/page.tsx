'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { researchService } from '@/lib/research';
import type { ResearchProject } from '@/types/database';
import AddProjectModal from '@/components/research/AddProjectModal';
import { Plus, FolderKanban, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    const data = await researchService.getProjects(user.id);
    setProjects(data);
    setLoading(false);
  };

  const handleSaveProject = async (projectData: { name: string; description: string; status: string }) => {
    if (!user) return;
    try {
      if (editingProject) {
        await researchService.updateProject(editingProject.id, user.id, projectData);
        toast.success('Project updated');
      } else {
        await researchService.createProject(user.id, projectData);
        toast.success('Project created');
      }
      await loadProjects();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this project? All associated literature and experiments will be unlinked or deleted.')) return;
    
    const success = await researchService.deleteProject(id, user.id);
    if (success) {
      toast.success('Project deleted');
      setProjects(projects.filter(p => p.id !== id));
    } else {
      toast.error('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'paused': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold ${themeClasses.primaryText}`}>Projects Tracking</h2>
          <p className="text-gray-500 text-sm">Manage your active and completed research projects.</p>
        </div>
        <button 
          onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a4531] hover:bg-[#073123] text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border border-dashed ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
            <FolderKanban size={32} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.primaryText}`}>No projects yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first research project to start tracking literature, experiments, and notes.</p>
          <button 
            onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className={`flex flex-col p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(project.status)} capitalize`}>
                  {project.status}
                </span>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => { setEditingProject(project); setIsModalOpen(true); }}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${themeClasses.primaryText}`}>
                {project.name}
              </h3>
              
              <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex justify-between items-center">
                <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">
                  Open Workspace &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddProjectModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
        onSave={handleSaveProject}
        initialData={editingProject}
      />
    </div>
  );
}
