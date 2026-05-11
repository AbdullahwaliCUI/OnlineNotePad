'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { promptsService } from '@/lib/prompts';
import type { PromptWithTexts, PromptInsert } from '@/types/database';
import AddPromptModal from '@/components/prompts/AddPromptModal';
import { 
  Search, Plus, Download, LayoutTemplate, 
  ChevronDown, ChevronUp, Star, Edit3, Trash2, Copy, FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromptsPage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [prompts, setPrompts] = useState<PromptWithTexts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptWithTexts | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All categories');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Expanded state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadPrompts();
    }
  }, [user]);

  const loadPrompts = async () => {
    if (!user) return;
    setLoading(true);
    const data = await promptsService.getPrompts(user.id);
    setPrompts(data);
    setLoading(false);
  };

  // Derived Stats
  const stats = useMemo(() => {
    const totalTopics = prompts.length;
    const totalTexts = prompts.reduce((acc, p) => acc + (p.prompt_texts?.length || 0), 0);
    const categories = new Set(prompts.map(p => p.category).filter(Boolean));
    const favorites = prompts.filter(p => p.is_favorite).length;
    
    return {
      totalTopics,
      totalTexts,
      totalCategories: categories.size,
      favorites
    };
  }, [prompts]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(prompts.map(p => p.category).filter(Boolean) as string[]);
    return ['All categories', ...Array.from(cats).sort()];
  }, [prompts]);

  // Filtered Prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      if (showFavoritesOnly && !p.is_favorite) return false;
      if (selectedCategory !== 'All categories' && p.category !== selectedCategory) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(query);
        const inCategory = (p.category || '').toLowerCase().includes(query);
        const inTags = p.tags?.some(t => t.toLowerCase().includes(query));
        const inTexts = p.prompt_texts?.some(t => t.content.toLowerCase().includes(query));
        return inTitle || inCategory || inTags || inTexts;
      }
      return true;
    });
  }, [prompts, searchQuery, selectedCategory, showFavoritesOnly]);

  const handleSavePrompt = async (promptData: PromptInsert, texts: string[]) => {
    if (!user) return;
    
    try {
      if (editingPrompt) {
        // Update existing
        await promptsService.updatePrompt(
          editingPrompt.id, 
          user.id, 
          { ...promptData, updated_at: new Date().toISOString() }, 
          texts.map(t => ({ content: t }))
        );
        toast.success('Prompt updated successfully');
      } else {
        // Create new
        await promptsService.createPrompt({ ...promptData, user_id: user.id }, texts);
        toast.success('Prompt created successfully');
      }
      await loadPrompts();
    } catch (e) {
      console.error(e);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this prompt?')) return;
    
    const success = await promptsService.deletePrompt(id, user.id);
    if (success) {
      toast.success('Prompt deleted');
      setPrompts(prompts.filter(p => p.id !== id));
    } else {
      toast.error('Failed to delete prompt');
    }
  };

  const handleToggleFavorite = async (p: PromptWithTexts) => {
    if (!user) return;
    const success = await promptsService.toggleFavorite(p.id, user.id, p.is_favorite);
    if (success) {
      setPrompts(prompts.map(prompt => 
        prompt.id === p.id ? { ...prompt, is_favorite: !p.is_favorite } : prompt
      ));
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTopics(newExpanded);
  };

  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Prompt text copied!');
      // Increment usage count in background
      promptsService.incrementUsageCount(promptId);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className={`min-h-full pb-10 ${themeClasses.background}`}>
      
      {/* Top Banner Area */}
      <div className={`mb-6 p-6 rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-widest rounded-full uppercase flex items-center gap-1.5">
                <LayoutTemplate size={12} /> Advanced Prompt Library
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${themeClasses.primaryText}`}>
              Reusable Prompt Workspace
            </h1>
            <p className={`${themeClasses.primaryText} opacity-70 text-sm sm:text-base`}>
              Organize prompts with categories, tags, favorites, template variables, and usage tracking.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => { setEditingPrompt(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} /> Add Prompt
            </button>
            <button className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${themeClasses.cardBorder} ${themeClasses.primaryText}`}>
              <Download size={18} className="rotate-180" /> Import Excel
            </button>
            <button className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${themeClasses.cardBorder} ${themeClasses.primaryText}`}>
              <LayoutTemplate size={18} /> Template
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0d5940] hover:bg-[#0a4531] text-white rounded-lg font-medium transition-colors">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-4 rounded-lg border ${themeClasses.cardBorder} bg-gray-50/50 dark:bg-gray-800/30`}>
            <div className="text-sm text-gray-500 mb-1">Total topics</div>
            <div className={`text-2xl font-semibold ${themeClasses.primaryText}`}>{stats.totalTopics}</div>
          </div>
          <div className={`p-4 rounded-lg border ${themeClasses.cardBorder} bg-gray-50/50 dark:bg-gray-800/30`}>
            <div className="text-sm text-gray-500 mb-1">Prompt texts</div>
            <div className={`text-2xl font-semibold ${themeClasses.primaryText}`}>{stats.totalTexts}</div>
          </div>
          <div className={`p-4 rounded-lg border ${themeClasses.cardBorder} bg-gray-50/50 dark:bg-gray-800/30`}>
            <div className="text-sm text-gray-500 mb-1">Categories</div>
            <div className={`text-2xl font-semibold ${themeClasses.primaryText}`}>{stats.totalCategories}</div>
          </div>
          <div className={`p-4 rounded-lg border ${themeClasses.cardBorder} bg-gray-50/50 dark:bg-gray-800/30`}>
            <div className="text-sm text-gray-500 mb-1">Favorite topics</div>
            <div className={`text-2xl font-semibold ${themeClasses.primaryText}`}>{stats.favorites}</div>
          </div>
          <div className={`p-4 rounded-lg border ${themeClasses.cardBorder} bg-blue-50/50 dark:bg-blue-900/10`}>
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Template mode</div>
            <div className={`text-sm font-medium ${themeClasses.primaryText}`}>Use {"{{variable}}"} placeholders</div>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className={`mb-6 p-4 rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm flex flex-col md:flex-row gap-4`}>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search title, category, prompt text, or tag"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
            />
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <label className="text-xs text-gray-500 mb-1 block">Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none appearance-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
          >
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="text-xs text-gray-500 mb-1 block">Favorites</label>
          <button 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`w-full px-4 py-2 flex justify-between items-center border rounded-lg transition-colors ${showFavoritesOnly ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : `${themeClasses.cardBorder} hover:bg-gray-50 dark:hover:bg-gray-800 ${themeClasses.primaryText}`}`}
          >
            <span>{showFavoritesOnly ? 'Favorites Only' : 'All Prompts'}</span>
            <Star size={16} className={showFavoritesOnly ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <div className={`p-10 text-center rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground}`}>
            <p className="text-gray-500">No prompts found matching your criteria.</p>
          </div>
        ) : (
          filteredPrompts.map(prompt => (
            <div key={prompt.id} className={`rounded-xl border ${themeClasses.cardBorder} ${themeClasses.cardBackground} shadow-sm overflow-hidden`}>
              
              {/* Header */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      {prompt.category && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
                          {prompt.category}
                        </span>
                      )}
                      
                      <button 
                        onClick={() => handleToggleFavorite(prompt)}
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${prompt.is_favorite ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800' : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                      >
                        <Star size={12} className={prompt.is_favorite ? 'fill-current' : ''} />
                        {prompt.is_favorite ? 'Favorited' : 'Favorite'}
                      </button>

                      <span className="text-xs text-gray-500">
                        {prompt.prompt_texts?.length || 0} prompt texts · Used {prompt.usage_count || 0} times
                      </span>
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${themeClasses.primaryText}`}>
                      {prompt.title}
                    </h3>
                    
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {prompt.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400">
                      Updated: {new Date(prompt.updated_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => toggleExpand(prompt.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {expandedTopics.has(prompt.id) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      {expandedTopics.has(prompt.id) ? 'Collapse' : 'Expand'}
                    </button>
                    
                    <button 
                      onClick={() => { setEditingPrompt(prompt); setIsModalOpen(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Edit3 size={16}/> Edit Topic
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(prompt.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={16}/> Delete Topic
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Body */}
              {expandedTopics.has(prompt.id) && (
                <div className={`p-4 border-t ${themeClasses.cardBorder} bg-gray-50/30 dark:bg-gray-800/20 space-y-4`}>
                  
                  {prompt.template_variables && prompt.template_variables.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex flex-wrap gap-2 items-center">
                      <span className="font-medium">Variables:</span>
                      {prompt.template_variables.map(v => (
                        <code key={v} className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
                          {`{{${v}}}`}
                        </code>
                      ))}
                    </div>
                  )}

                  {prompt.prompt_texts?.map((t, index) => (
                    <div key={t.id} className={`p-4 rounded-lg bg-white dark:bg-gray-800 border ${themeClasses.cardBorder} relative group`}>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => copyToClipboard(t.content, prompt.id)}
                          className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900 dark:hover:text-emerald-400 rounded text-gray-500 transition-colors"
                          title="Copy Prompt"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Text Version {index + 1}
                      </div>
                      <p className={`text-sm whitespace-pre-wrap ${themeClasses.primaryText}`}>
                        {t.content}
                      </p>
                    </div>
                  ))}
                  
                  {(!prompt.prompt_texts || prompt.prompt_texts.length === 0) && (
                    <p className="text-sm text-gray-500">No prompt texts added to this topic yet.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AddPromptModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPrompt(null); }}
        onSave={handleSavePrompt}
        initialData={editingPrompt}
      />
    </div>
  );
}
