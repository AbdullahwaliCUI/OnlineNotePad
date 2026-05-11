import { supabase } from './supabaseClient';
import type { ResearchProject } from '@/types/database';

export const researchService = {
  // =============================================
  // PROJECTS
  // =============================================

  async getProjects(userId: string): Promise<ResearchProject[]> {
    const { data, error } = await supabase
      .from('research_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data || [];
  },

  async getProject(projectId: string, userId: string): Promise<ResearchProject | null> {
    const { data, error } = await supabase
      .from('research_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }
    return data;
  },

  async createProject(
    userId: string, 
    project: { name: string; description?: string; status?: string }
  ): Promise<ResearchProject | null> {
    const { data, error } = await supabase
      .from('research_projects')
      .insert({
        user_id: userId,
        name: project.name,
        description: project.description || null,
        status: project.status || 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    return data;
  },

  async updateProject(
    projectId: string, 
    userId: string, 
    updates: { name?: string; description?: string; status?: string }
  ): Promise<ResearchProject | null> {
    const { data, error } = await supabase
      .from('research_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    return data;
  },

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('research_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    return true;
  }
};
