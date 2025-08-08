'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';
import { Archetype, PersonalityTrait, ConversationFlow } from '@/types/wizard';

// BE-102: Server Actions to fetch templates

/**
 * Fetches agent archetypes from the database.
 * @param niche - Optional filter by niche.
 * @param use_case - Optional filter by use case.
 * @returns A promise that resolves to an array of agent archetypes.
 */
export async function getAgentArchetypes(
  niche?: string,
  use_case?: string
): Promise<Archetype[]> {
  logger.debug('Fetching agent archetypes');

  const supabase = await createClient();

  try {
    let query = supabase.from('agent_archetypes').select('*').eq('is_active', true);

    if (niche) {
      logger.debug('Filtering by niche', { hasNiche: true });
      query = query.eq('niche', niche);
    }
    if (use_case) {
      logger.debug('Filtering by use_case', { hasUseCase: true });
      query = query.eq('use_case', use_case);
    }

    logger.debug('Executing archetypes query');
    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch agent archetypes', error);
      throw new Error('Could not fetch agent archetypes.');
    }

    logger.debug('Agent archetypes query completed', { count: data?.length || 0 });
    
    // Log sample data apenas em desenvolvimento
    if (data && data.length > 0 && process.env.NODE_ENV === 'development') {
        logger.debug('Sample archetype data available');
    }

    return data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error in getAgentArchetypes', new Error(errorMessage));
    return [];
  }
}

/**
 * Fetches personality traits from the database.
 * @returns A promise that resolves to an array of personality traits.
 */
export async function getPersonalityTraits(): Promise<PersonalityTrait[]> {
  logger.debug('Fetching personality traits');
  const supabase = await createClient();

  try {
    logger.debug('Building personality traits query');
    
    const query = supabase
      .from('personality_traits')
      .select('*')
      .eq('is_active', true);
    
    logger.debug('Executing personality traits query');
    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch personality traits', error);
      throw new Error('Could not fetch personality traits.');
    }
    
    logger.debug('Personality traits query completed', { count: data?.length || 0 });
    
    // Log sample data apenas em desenvolvimento
    if (data && data.length > 0 && process.env.NODE_ENV === 'development') {
        logger.debug('Sample personality traits data available');
    }

    return data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error in getPersonalityTraits', new Error(errorMessage));
    return [];
  }
}

/**
 * Fetches conversation flows from the database.
 * @param niche - Optional filter by niche.
 * @returns A promise that resolves to an array of conversation flows.
 */
export async function getConversationFlows(
  niche?: string
): Promise<ConversationFlow[]> {
  logger.debug('Fetching conversation flows');
  const supabase = await createClient();

  try {
    logger.debug('Building conversation flows query');
    let query = supabase.from('conversation_flows').select('*').eq('is_active', true);
    
    if (niche) {
      logger.debug('Filtering by niche', { hasNiche: true });
      query = query.eq('niche', niche);
    }
    
    logger.debug('Executing conversation flows query');
    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch conversation flows', error);
      throw new Error('Could not fetch conversation flows.');
    }
    
    logger.debug('Conversation flows query completed', { count: data?.length || 0 });
    
    // Log sample data apenas em desenvolvimento
    if (data && data.length > 0 && process.env.NODE_ENV === 'development') {
        logger.debug('Sample conversation flows data available');
    }

    return data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error in getConversationFlows', new Error(errorMessage));
    return [];
  }
}
