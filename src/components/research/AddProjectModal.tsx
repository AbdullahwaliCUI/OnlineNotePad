'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Save } from 'lucide-react';
import type { ResearchProject } from '@/types/database';
import toast from 'react-hot-toast';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { name: string; description: string; status: string }) => Promise<void>;
  initialData?: ResearchProject | null;
}

export default function AddProjectModal({ isOpen, onClose, onSave, initialData }: AddProjectModalProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setStatus(initialData.status);
      } else {
        setName('');
        setDescription('');
        setStatus('active');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        status
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`w-full max-w-lg my-8 rounded-xl shadow-2xl ${themeClasses.cardBackground} border ${themeClasses.cardBorder} flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className={`text-xl font-semibold ${themeClasses.primaryText}`}>
            {initialData ? 'Edit Research Project' : 'New Research Project'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${themeClasses.primaryText}`}>Project Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quantum Computing Thesis"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${themeClasses.primaryText}`}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the research goals..."
              className={`w-full p-3 rounded-lg border focus:ring-2 outline-none min-h-[100px] resize-y ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${themeClasses.primaryText}`}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none appearance-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0a4531] text-white rounded-lg font-medium hover:bg-[#073123] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Project
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className={`px-6 py-2.5 border rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${themeClasses.cardBorder} ${themeClasses.primaryText}`}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
