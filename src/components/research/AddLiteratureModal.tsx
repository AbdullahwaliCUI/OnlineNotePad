import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { X } from 'lucide-react';
import type { ResearchLiterature, ResearchProject } from '@/types/database';

interface AddLiteratureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; authors?: string; url?: string; notes?: string; project_id?: string }) => void;
  initialData?: ResearchLiterature | null;
  projects?: ResearchProject[];
}

export default function AddLiteratureModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  projects = []
}: AddLiteratureModalProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setAuthors(initialData.authors || '');
        setUrl(initialData.url || '');
        setNotes(initialData.notes || '');
        setProjectId(initialData.project_id || '');
      } else {
        setTitle('');
        setAuthors('');
        setUrl('');
        setNotes('');
        setProjectId('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      title, 
      authors: authors || undefined,
      url: url || undefined,
      notes: notes || undefined,
      project_id: projectId || undefined 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] ${themeClasses.cardBackground} border ${themeClasses.cardBorder} animate-in zoom-in-95 duration-200`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className={`text-xl font-bold ${themeClasses.primaryText}`}>
            {initialData ? 'Edit Literature' : 'Add Literature'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Paper Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="E.g., Attention Is All You Need"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Authors
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="E.g., Vaswani et al."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL / DOI
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="https://arxiv.org/abs/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Linked Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">No Project Linked</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-y"
                placeholder="Key takeaways, methods, or limitations..."
              ></textarea>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0a4531] hover:bg-[#073123] text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Save Literature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
