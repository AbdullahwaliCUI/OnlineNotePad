import { supabase } from './supabaseClient';
import type { Prompt, PromptInsert, PromptUpdate, PromptText, PromptTextInsert, PromptWithTexts } from '@/types/database';

export const promptsService = {
  // Fetch all prompts with their associated texts for a user
  async getPrompts(userId: string): Promise<PromptWithTexts[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        prompt_texts (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    return data || [];
  },

  // Get a single prompt by ID
  async getPrompt(promptId: string, userId: string): Promise<PromptWithTexts | null> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        prompt_texts (*)
      `)
      .eq('id', promptId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching prompt:', error);
      return null;
    }

    return data;
  },

  // Create a new prompt along with its texts
  async createPrompt(prompt: PromptInsert, texts: string[]): Promise<PromptWithTexts | null> {
    // 1. Insert prompt
    const { data: newPrompt, error: promptError } = await supabase
      .from('prompts')
      .insert(prompt)
      .select()
      .single();

    if (promptError || !newPrompt) {
      console.error('Error creating prompt:', promptError);
      return null;
    }

    // 2. Insert texts
    if (texts.length > 0) {
      const textInserts: PromptTextInsert[] = texts.map((content, index) => ({
        prompt_id: newPrompt.id,
        content,
        sort_order: index,
      }));

      const { error: textsError } = await supabase
        .from('prompt_texts')
        .insert(textInserts);

      if (textsError) {
        console.error('Error creating prompt texts:', textsError);
      }
    }

    return this.getPrompt(newPrompt.id, prompt.user_id);
  },

  // Update a prompt and its texts
  async updatePrompt(
    promptId: string, 
    userId: string, 
    promptUpdates: PromptUpdate, 
    texts: { id?: string; content: string }[]
  ): Promise<PromptWithTexts | null> {
    // 1. Update main prompt
    const { error: promptError } = await supabase
      .from('prompts')
      .update({ ...promptUpdates, updated_at: new Date().toISOString() })
      .eq('id', promptId)
      .eq('user_id', userId);

    if (promptError) {
      console.error('Error updating prompt:', promptError);
      return null;
    }

    // 2. Sync texts
    // For simplicity: delete existing texts and re-insert to handle additions/deletions easily.
    // In production, an upsert or diff approach is more optimal.
    const { error: deleteError } = await supabase
      .from('prompt_texts')
      .delete()
      .eq('prompt_id', promptId);

    if (deleteError) {
      console.error('Error clearing old prompt texts:', deleteError);
    } else if (texts.length > 0) {
      const textInserts: PromptTextInsert[] = texts.map((t, index) => ({
        prompt_id: promptId,
        content: t.content,
        sort_order: index,
      }));

      const { error: textsError } = await supabase
        .from('prompt_texts')
        .insert(textInserts);

      if (textsError) {
        console.error('Error inserting new prompt texts:', textsError);
      }
    }

    return this.getPrompt(promptId, userId);
  },

  // Delete a prompt
  async deletePrompt(promptId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }

    return true;
  },

  // Toggle favorite status
  async toggleFavorite(promptId: string, userId: string, currentStatus: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('prompts')
      .update({ is_favorite: !currentStatus })
      .eq('id', promptId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }

    return true;
  },

  // Increment usage count
  async incrementUsageCount(promptId: string): Promise<void> {
    const { data: current, error: fetchError } = await supabase
      .from('prompts')
      .select('usage_count')
      .eq('id', promptId)
      .single();

    if (fetchError || !current) return;

    await supabase
      .from('prompts')
      .update({ usage_count: (current.usage_count || 0) + 1 })
      .eq('id', promptId);
  }
};
