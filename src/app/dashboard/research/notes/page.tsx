'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { researchService } from '@/lib/research';
import type { ResearchNote, ResearchProject } from '@/types/database';
import AddResearchNoteModal from '@/components/research/AddResearchNoteModal';
import { Plus, StickyNote, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [notesData, projectsData] = await Promise.all([
        researchService.getResearchNotes(user.id),
        researchService.getProjects(user.id)
      ]);
      setNotes(notesData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Failed to load research notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (noteData: { title: string; content: string; project_id?: string }) => {
    if (!user) return;
    try {
      if (editingNote) {
        await researchService.updateResearchNote(editingNote.id, user.id, noteData);
        toast.success('Note updated');
      } else {
        await researchService.createResearchNote(user.id, noteData);
        toast.success('Note created');
      }
      setIsModalOpen(false);
      setEditingNote(null);
      await loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this research note?')) return;
    
    const success = await researchService.deleteResearchNote(id, user.id);
    if (success) {
      toast.success('Note deleted');
      setNotes(notes.filter(n => n.id !== id));
    } else {
      toast.error('Failed to delete note');
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
          <h2 className={`text-xl font-bold ${themeClasses.primaryText}`}>Research Notes</h2>
          <p className="text-gray-500 text-sm">Quick notes, meeting minutes, and brainstorming sessions.</p>
        </div>
        <button 
          onClick={() => { setEditingNote(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a4531] hover:bg-[#073123] text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> New Note
        </button>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border border-dashed ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
            <StickyNote size={32} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.primaryText}`}>No research notes yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first research note to quickly jot down ideas and findings.</p>
          <button 
            onClick={() => { setEditingNote(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} /> Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className={`flex flex-col p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700 truncate max-w-[150px]`}>
                  {getProjectName(note.project_id)}
                </span>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => { setEditingNote(note); setIsModalOpen(true); }}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${themeClasses.primaryText}`}>
                {note.title}
              </h3>
              
              <p className="text-sm text-gray-500 line-clamp-4 mb-4 flex-1 whitespace-pre-wrap">
                {note.content}
              </p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                Updated: {new Date(note.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddResearchNoteModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingNote(null); }}
        onSave={handleSaveNote}
        initialData={editingNote}
        projects={projects}
      />
    </div>
  );
}
