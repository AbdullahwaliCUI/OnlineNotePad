import { supabase } from './supabaseClient';
import type { ResearchProject, ResearchNote, ResearchLiterature, ResearchExperiment } from '@/types/database';

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
  },

  // =============================================
  // RESEARCH NOTES
  // =============================================

  async getResearchNotes(userId: string): Promise<ResearchNote[]> {
    const { data, error } = await supabase
      .from('research_notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching research notes:', error);
      return [];
    }
    return data || [];
  },

  async createResearchNote(
    userId: string,
    note: { title: string; content: string; project_id?: string }
  ): Promise<ResearchNote | null> {
    const { data, error } = await supabase
      .from('research_notes')
      .insert({
        user_id: userId,
        title: note.title,
        content: note.content,
        project_id: note.project_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating research note:', error);
      return null;
    }
    return data;
  },

  async updateResearchNote(
    noteId: string,
    userId: string,
    updates: { title?: string; content?: string; project_id?: string }
  ): Promise<ResearchNote | null> {
    const { data, error } = await supabase
      .from('research_notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating research note:', error);
      return null;
    }
    return data;
  },

  async deleteResearchNote(noteId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('research_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting research note:', error);
      return false;
    }
    return true;
  },

  // =============================================
  // RESEARCH LITERATURE
  // =============================================

  async getLiterature(userId: string): Promise<ResearchLiterature[]> {
    const { data, error } = await supabase
      .from('research_literature')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching literature:', error);
      return [];
    }
    return data || [];
  },

  async createLiterature(
    userId: string,
    item: { title: string; authors?: string; url?: string; notes?: string; project_id?: string }
  ): Promise<ResearchLiterature | null> {
    const { data, error } = await supabase
      .from('research_literature')
      .insert({
        user_id: userId,
        title: item.title,
        authors: item.authors || null,
        url: item.url || null,
        notes: item.notes || null,
        project_id: item.project_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating literature:', error);
      return null;
    }
    return data;
  },

  async updateLiterature(
    literatureId: string,
    userId: string,
    updates: { title?: string; authors?: string; url?: string; notes?: string; project_id?: string }
  ): Promise<ResearchLiterature | null> {
    const { data, error } = await supabase
      .from('research_literature')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', literatureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating literature:', error);
      return null;
    }
    return data;
  },

  async deleteLiterature(literatureId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('research_literature')
      .delete()
      .eq('id', literatureId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting literature:', error);
      return false;
    }
    return true;
  },

  // =============================================
  // RESEARCH EXPERIMENTS
  // =============================================

  async getExperiments(userId: string): Promise<ResearchExperiment[]> {
    const { data, error } = await supabase
      .from('research_experiments')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiments:', error);
      return [];
    }
    return data || [];
  },

  async createExperiment(
    userId: string,
    exp: { title: string; status?: string; results?: string; project_id?: string }
  ): Promise<ResearchExperiment | null> {
    const { data, error } = await supabase
      .from('research_experiments')
      .insert({
        user_id: userId,
        title: exp.title,
        status: exp.status || 'planned',
        results: exp.results || null,
        project_id: exp.project_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating experiment:', error);
      return null;
    }
    return data;
  },

  async updateExperiment(
    experimentId: string,
    userId: string,
    updates: { title?: string; status?: string; results?: string; project_id?: string }
  ): Promise<ResearchExperiment | null> {
    const { data, error } = await supabase
      .from('research_experiments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', experimentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating experiment:', error);
      return null;
    }
    return data;
  },

  async deleteExperiment(experimentId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('research_experiments')
      .delete()
      .eq('id', experimentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting experiment:', error);
      return false;
    }
    return true;
  }
};
