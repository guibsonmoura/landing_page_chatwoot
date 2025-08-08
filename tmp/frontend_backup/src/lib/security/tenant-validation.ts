import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import logger from '@/lib/logger';

/**
 * Resultado da validação de propriedade de tenant
 */
export interface TenantValidationResult {
  success: boolean;
  tenantId?: string;
  error?: string;
}

/**
 * Valida se um usuário autenticado possui um tenant válido
 * @param supabase Cliente Supabase
 * @param userId ID do usuário autenticado
 * @returns Resultado da validação com tenantId se bem-sucedido
 */
export async function validateUserTenant(
  supabase: SupabaseClient,
  userId: string
): Promise<TenantValidationResult> {
  try {
    if (!userId || !z.string().uuid().safeParse(userId).success) {
      return { success: false, error: 'ID de usuário inválido.' };
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (tenantError) {
      logger.error('Failed to fetch user tenant', { userId, error: tenantError });
      return { success: false, error: 'Erro ao buscar tenant do usuário.' };
    }

    if (!tenant) {
      logger.warn('No tenant found for user', { userId });
      return { success: false, error: 'Tenant não encontrado para o usuário.' };
    }

    return { success: true, tenantId: tenant.id };
  } catch (error: any) {
    logger.error('Unexpected error in validateUserTenant', { userId, error });
    return { success: false, error: 'Erro inesperado na validação do tenant.' };
  }
}

/**
 * Valida se um recurso pertence ao tenant do usuário autenticado
 * @param supabase Cliente Supabase
 * @param userId ID do usuário autenticado
 * @param tableName Nome da tabela onde está o recurso
 * @param resourceId ID do recurso a ser validado
 * @param resourceIdColumn Nome da coluna do ID do recurso (padrão: 'id')
 * @returns Resultado da validação com tenantId se bem-sucedido
 */
export async function validateTenantOwnership(
  supabase: SupabaseClient,
  userId: string,
  tableName: string,
  resourceId: string,
  resourceIdColumn: string = 'id'
): Promise<TenantValidationResult> {
  try {
    // Validar entrada
    if (!resourceId || !z.string().uuid().safeParse(resourceId).success) {
      return { success: false, error: 'ID do recurso inválido.' };
    }

    if (!tableName || typeof tableName !== 'string') {
      return { success: false, error: 'Nome da tabela inválido.' };
    }

    // 1. Validar tenant do usuário
    const userTenantResult = await validateUserTenant(supabase, userId);
    if (!userTenantResult.success) {
      return userTenantResult;
    }

    const userTenantId = userTenantResult.tenantId!;

    // 2. Buscar o recurso e seu tenant_id
    const { data: resource, error: resourceError } = await supabase
      .from(tableName)
      .select('tenant_id')
      .eq(resourceIdColumn, resourceId)
      .single();

    if (resourceError) {
      logger.error('Failed to fetch resource for tenant validation', {
        tableName,
        resourceId,
        resourceIdColumn,
        error: resourceError
      });
      
      if (resourceError.code === 'PGRST116') {
        return { success: false, error: 'Recurso não encontrado.' };
      }
      
      return { success: false, error: 'Erro ao buscar recurso.' };
    }

    if (!resource || !resource.tenant_id) {
      logger.warn('Resource found but no tenant_id', {
        tableName,
        resourceId,
        resource
      });
      return { success: false, error: 'Recurso não possui tenant associado.' };
    }

    // 3. Validar se o recurso pertence ao tenant do usuário
    if (resource.tenant_id !== userTenantId) {
      logger.warn('Tenant ownership validation failed - access denied', {
        userId,
        userTenantId,
        resourceTenantId: resource.tenant_id,
        tableName,
        resourceId
      });
      return { 
        success: false, 
        error: 'Acesso negado. Recurso não pertence ao seu tenant.' 
      };
    }

    logger.debug('Tenant ownership validation successful', {
      userId,
      tenantId: userTenantId,
      tableName,
      resourceId
    });

    return { success: true, tenantId: userTenantId };

  } catch (error: any) {
    logger.error('Unexpected error in validateTenantOwnership', {
      userId,
      tableName,
      resourceId,
      error
    });
    return { success: false, error: 'Erro inesperado na validação de propriedade.' };
  }
}

/**
 * Middleware para validar autenticação e tenant do usuário
 * @param supabase Cliente Supabase
 * @returns Resultado da validação com userId e tenantId se bem-sucedido
 */
export async function validateAuthenticatedUser(
  supabase: SupabaseClient
): Promise<TenantValidationResult & { userId?: string }> {
  try {
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logger.error('Authentication error', authError);
      return { success: false, error: 'Erro de autenticação.' };
    }

    if (!user) {
      logger.warn('No authenticated user found');
      return { success: false, error: 'Usuário não autenticado.' };
    }

    // 2. Validar tenant
    const tenantResult = await validateUserTenant(supabase, user.id);
    if (!tenantResult.success) {
      return tenantResult;
    }

    return { 
      success: true, 
      userId: user.id, 
      tenantId: tenantResult.tenantId 
    };

  } catch (error: any) {
    logger.error('Unexpected error in validateAuthenticatedUser', error);
    return { success: false, error: 'Erro inesperado na validação do usuário.' };
  }
}

/**
 * Utilitário para executar operações com validação de tenant
 * @param supabase Cliente Supabase
 * @param tableName Nome da tabela
 * @param resourceId ID do recurso
 * @param operation Operação a ser executada após validação
 * @param resourceIdColumn Nome da coluna do ID do recurso (padrão: 'id')
 * @returns Resultado da operação
 */
export async function executeWithTenantValidation<T>(
  supabase: SupabaseClient,
  tableName: string,
  resourceId: string,
  operation: (tenantId: string, userId: string) => Promise<T>,
  resourceIdColumn: string = 'id'
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // 1. Validar usuário autenticado
    const authResult = await validateAuthenticatedUser(supabase);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { userId, tenantId } = authResult;

    // 2. Validar propriedade do recurso
    const ownershipResult = await validateTenantOwnership(
      supabase,
      userId!,
      tableName,
      resourceId,
      resourceIdColumn
    );

    if (!ownershipResult.success) {
      return { success: false, error: ownershipResult.error };
    }

    // 3. Executar operação
    const result = await operation(tenantId!, userId!);
    return { success: true, data: result };

  } catch (error: any) {
    logger.error('Error in executeWithTenantValidation', {
      tableName,
      resourceId,
      error
    });
    return { 
      success: false, 
      error: error.message || 'Erro inesperado na operação.' 
    };
  }
}
