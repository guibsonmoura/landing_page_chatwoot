// Server Actions for CMS (Content Management System)
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import logger from '@/lib/logger';

// Types
export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSComponent {
  id: string;
  page_id: string;
  component_type: string;
  component_key: string;
  title?: string;
  subtitle?: string;
  content: any; // JSON content
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSSetting {
  id: string;
  setting_key: string;
  setting_value: any; // JSON value
  description?: string;
  created_at: string;
  updated_at: string;
}

// Get page by slug with all components
export async function getCMSPageBySlug(slug: string): Promise<{
  page: CMSPage | null;
  components: CMSComponent[];
}> {
  try {
    const supabase = await createClient();

    // Get page
    const { data: page, error: pageError } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (pageError) {
      logger.error('Error fetching CMS page', { slug, error: pageError.message });
      return { page: null, components: [] };
    }

    // Get components for this page
    const { data: components, error: componentsError } = await supabase
      .from('cms_components')
      .select('*')
      .eq('page_id', page.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (componentsError) {
      logger.error('Error fetching CMS components', { 
        pageId: page.id, 
        error: componentsError.message 
      });
      return { page, components: [] };
    }

    logger.info('CMS page fetched successfully', { 
      slug, 
      pageId: page.id, 
      componentsCount: components?.length || 0 
    });

    return { page, components: components || [] };
  } catch (error) {
    logger.error('Unexpected error in getCMSPageBySlug', { slug, error });
    return { page: null, components: [] };
  }
}

// Get component by key
export async function getCMSComponent(pageSlug: string, componentKey: string): Promise<CMSComponent | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cms_components')
      .select(`
        *,
        cms_pages!inner(slug)
      `)
      .eq('cms_pages.slug', pageSlug)
      .eq('component_key', componentKey)
      .eq('is_active', true)
      .single();

    if (error) {
      logger.error('Error fetching CMS component', { 
        pageSlug, 
        componentKey, 
        error: error.message 
      });
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Unexpected error in getCMSComponent', { pageSlug, componentKey, error });
    return null;
  }
}

// Get all settings
export async function getCMSSettings(): Promise<Record<string, any>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cms_settings')
      .select('setting_key, setting_value');

    if (error) {
      logger.error('Error fetching CMS settings', { error: error.message });
      return {};
    }

    // Convert to key-value object
    const settings: Record<string, any> = {};
    data?.forEach((setting: { setting_key: string; setting_value: any }) => {
      settings[setting.setting_key] = setting.setting_value;
    });

    logger.info('CMS settings fetched successfully', { settingsCount: data?.length || 0 });
    return settings;
  } catch (error) {
    logger.error('Unexpected error in getCMSSettings', { error });
    return {};
  }
}

// Get specific setting
export async function getCMSSetting(key: string): Promise<any> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cms_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

    if (error) {
      logger.error('Error fetching CMS setting', { key, error: error.message });
      return null;
    }

    return data?.setting_value;
  } catch (error) {
    logger.error('Unexpected error in getCMSSetting', { key, error });
    return null;
  }
}

// Update component content
export async function updateCMSComponent(
  componentId: string, 
  updates: Partial<Pick<CMSComponent, 'title' | 'subtitle' | 'content'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('cms_components')
      .update(updates)
      .eq('id', componentId);

    if (error) {
      logger.error('Error updating CMS component', { 
        componentId, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }

    // Revalidate the home page to reflect changes
    revalidatePath('/');
    
    logger.info('CMS component updated successfully', { componentId });
    return { success: true };
  } catch (error) {
    logger.error('Unexpected error in updateCMSComponent', { componentId, error });
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// Update setting
export async function updateCMSSetting(
  key: string, 
  value: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('cms_settings')
      .upsert({
        setting_key: key,
        setting_value: value
      });

    if (error) {
      logger.error('Error updating CMS setting', { key, error: error.message });
      return { success: false, error: error.message };
    }

    // Revalidate relevant paths
    revalidatePath('/');
    
    logger.info('CMS setting updated successfully', { key });
    return { success: true };
  } catch (error) {
    logger.error('Unexpected error in updateCMSSetting', { key, error });
    return { success: false, error: 'Unexpected error occurred' };
  }
}
