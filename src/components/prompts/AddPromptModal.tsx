'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Plus, Trash2 } from 'lucide-react';
import type { PromptInsert, PromptWithTexts } from '@/types/database';
import toast from 'react-hot-toast';

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: PromptInsert, texts: string[]) => Promise<void>;
  initialData?: PromptWithTexts | null;
}

export default function AddPromptModal({ isOpen, onClose, onSave, initialData }: AddPromptModalProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [variables, setVariables] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [promptTexts, setPromptTexts] = useState<string[]>(['']);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category || '');
        setTitle(initialData.title);
        setTags(initialData.tags?.join(', ') || '');
        setVariables(initialData.template_variables?.join(', ') || '');
        setIsFavorite(initialData.is_favorite);
        
        if (initialData.prompt_texts && initialData.prompt_texts.length > 0) {
          // sort texts
          const sorted = [...initialData.prompt_texts].sort((a, b) => a.sort_order - b.sort_order);
          setPromptTexts(sorted.map(t => t.content));
        } else {
          setPromptTexts(['']);
        }
      } else {
        // Reset form
        setCategory('');
        setTitle('');
        setTags('');
        setVariables('');
        setIsFavorite(false);
        setPromptTexts(['']);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddText = () => {
    setPromptTexts([...promptTexts, '']);
  };

  const handleRemoveText = (index: number) => {
    if (promptTexts.length > 1) {
      const newTexts = [...promptTexts];
      newTexts.splice(index, 1);
      setPromptTexts(newTexts);
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...promptTexts];
    newTexts[index] = value;
    setPromptTexts(newTexts);
  };

  const parseCommaSeparated = (str: string) => {
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Topic / Title is required');
      return;
    }
    
    // Filter out empty texts
    const validTexts = promptTexts.filter(t => t.trim().length > 0);
    if (validTexts.length === 0) {
      toast.error('At least one prompt text is required');
      return;
    }

    setIsSaving(true);
    try {
      const promptData: PromptInsert = {
        user_id: '', // Will be set in page.tsx or service
        title: title.trim(),
        category: category.trim() || null,
        tags: parseCommaSeparated(tags),
        template_variables: parseCommaSeparated(variables),
        is_favorite: isFavorite,
      };

      await onSave(promptData, validTexts);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`w-full max-w-3xl my-8 rounded-xl shadow-2xl ${themeClasses.cardBackground} border ${themeClasses.cardBorder} flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${themeClasses.primaryText}`}>
                {initialData ? 'Edit Prompt' : 'Add Prompt'}
              </h2>
              <p className="text-sm text-gray-500">Same topic ke liye multiple prompts save karein with tags and template placeholders.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${themeClasses.primaryText}`}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Assignments, Research, Emails"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
            />
          </div>

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${themeClasses.primaryText}`}>Topic / Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Same topic par multiple prompts save kar sakte hain"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Ek hi topic ke neeche multiple prompts allowed hain.</p>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${themeClasses.primaryText}`}>Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma separated tags"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
            />
          </div>

          {/* Variables */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${themeClasses.primaryText}`}>Template Variables</label>
            <input
              type="text"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder="student_name, assignment_name"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
            />
            <p className="text-xs text-gray-500 mt-1">You can also detect variables directly from {"{{placeholders}}"} in prompt text.</p>
          </div>

          {/* Favorite */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <span className={`text-sm ${themeClasses.primaryText}`}>Mark as favorite</span>
          </label>

          <hr className={`border ${themeClasses.cardBorder}`} />

          {/* Prompt Texts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-medium ${themeClasses.primaryText}`}>Prompt Texts <span className="text-red-500">*</span></h3>
                <p className="text-xs text-gray-500">Aik hi topic ke neeche jitne prompt texts chahen add ya edit kar sakte hain.</p>
              </div>
              <button
                type="button"
                onClick={handleAddText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} /> Add Prompt Text
              </button>
            </div>

            <div className="space-y-4">
              {promptTexts.map((text, index) => (
                <div key={index} className={`p-4 rounded-lg border ${themeClasses.cardBorder} bg-gray-50/50 dark:bg-gray-800/30`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Prompt Text {index + 1}</span>
                    {promptTexts.length > 1 && (
                      <button 
                        onClick={() => handleRemoveText(index)}
                        className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    placeholder={`Write the full prompt here. Example: Write feedback for {{student_name}} on {{assignment_name}}.`}
                    className={`w-full p-3 rounded-lg border focus:ring-2 outline-none min-h-[120px] resize-y ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#111827] dark:bg-emerald-600 text-white rounded-lg font-medium hover:bg-black dark:hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Save Prompt
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
