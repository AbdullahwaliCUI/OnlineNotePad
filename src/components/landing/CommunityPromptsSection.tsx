'use client';

import { useState, useEffect } from 'react';
import { promptsService } from '@/lib/prompts';
import type { PromptWithTexts } from '@/types/database';
import { Copy, Sparkles, LayoutTemplate, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommunityPromptsSection() {
  const [prompts, setPrompts] = useState<(PromptWithTexts & { profiles?: { full_name: string | null } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const publicPrompts = await promptsService.getPublicPrompts();
        setPrompts(publicPrompts.slice(0, 6)); // Display top 6 for landing page
      } catch (error) {
        console.error('Failed to load public prompts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  const handleCopy = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Prompt copied to clipboard!');
      // Increment usage count in the background
      promptsService.incrementUsageCount(promptId);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (loading || prompts.length === 0) {
    return null; // Hide section if loading or no public prompts available
  }

  return (
    <section className="py-24 bg-white dark:bg-[#0B1120] relative overflow-hidden" id="community-prompts">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-50 dark:bg-emerald-900/10 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-blue-50 dark:bg-blue-900/10 blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-6">
            <Sparkles size={16} />
            <span>Community Prompts</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">Powerful Prompts</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore and copy the best prompts shared by the NotepadX community to supercharge your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {prompts.map((prompt) => (
            <div 
              key={prompt.id}
              className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-100 dark:border-emerald-800/50">
                  {prompt.category || 'General'}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <LayoutTemplate size={12} /> Used {prompt.usage_count || 0} times
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {prompt.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow line-clamp-4 relative">
                {prompt.prompt_texts?.[0]?.content || "No prompt text provided."}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800/50 to-transparent pointer-events-none" />
              </p>
              
              <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300">
                    <User size={12} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {prompt.profiles?.full_name || 'Anonymous'}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleCopy(prompt.prompt_texts?.[0]?.content || '', prompt.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 dark:bg-gray-800 dark:hover:bg-emerald-900/30 text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-xs font-semibold rounded-lg transition-colors border border-gray-200 dark:border-gray-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-800"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
