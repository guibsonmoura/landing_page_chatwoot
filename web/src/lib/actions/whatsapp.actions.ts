'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import logger from '@/lib/logger';

/**
 * Atualiza o status de conexão de um canal WhatsApp
 * @param channelId ID do canal a ser atualizado
 * @param isConnected Status de conexão (true = conectado)
 */
export async function updateWhatsAppConnectionStatus(channelId: string, isConnected: boolean) {
  const supabase = await createClient();

  try {
    // 1. Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // 2. Verificar se o canal pertence ao tenant do usuário
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenantData) {
      throw new Error('Tenant não encontrado.');
    }

    // 3. Atualizar o status do canal
    const { error: updateError } = await supabase
      .from('tenant_channels')
      .update({ 
        is_active: isConnected,
        // Adicionar campo na config indicando que o canal está conectado
        config: supabase.rpc('jsonb_set_deep', {
          target: supabase.rpc('get_channel_config', { channel_id: channelId }),
          path: '{connection_status}',
          value: isConnected ? 'connected' : 'disconnected'
        })
      })
      .eq('id', channelId)
      .eq('tenant_id', tenantData.id);

    if (updateError) {
      throw new Error(`Erro ao atualizar status do canal: ${updateError.message}`);
    }

    // 4. Revalidar o caminho para atualizar a UI
    revalidatePath('/dashboard/channels');
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to update WhatsApp channel status', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Verifica o status de conexão de um canal WhatsApp
 * @param channelId ID do canal a ser verificado
 */
export async function checkWhatsAppConnectionStatus(channelId: string) {
  const supabase = await createClient();

  try {
    // 1. Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // 2. Verificar se o canal pertence ao tenant do usuário
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenantData) {
      throw new Error('Tenant não encontrado.');
    }

    // 3. Obter o status do canal
    const { data: channelData, error: channelError } = await supabase
      .from('tenant_channels')
      .select('is_active, config')
      .eq('id', channelId)
      .eq('tenant_id', tenantData.id)
      .single();

    if (channelError || !channelData) {
      throw new Error('Canal não encontrado.');
    }

    // 4. Verificar o status de conexão na configuração
    let connectionStatus = 'unknown';
    if (typeof channelData.config === 'object' && channelData.config !== null) {
      connectionStatus = channelData.config.connection_status || 'unknown';
    } else if (typeof channelData.config === 'string') {
      try {
        const config = JSON.parse(channelData.config);
        connectionStatus = config.connection_status || 'unknown';
      } catch (e) {
        connectionStatus = 'unknown';
      }
    }

    return { 
      success: true, 
      isActive: channelData.is_active,
      connectionStatus
    };
  } catch (error) {
    logger.error('Failed to check WhatsApp channel status', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}
