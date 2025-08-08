import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter tenant_id do usuário autenticado
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (tenantError || !tenantData) {
      console.error('Erro ao obter tenant_id:', tenantError);
      return NextResponse.json({ error: 'Erro ao obter informações do tenant' }, { status: 500 });
    }

    // Obter dados do corpo da requisição
    const { file_name, file_url, agent_id, metadata } = await request.json();

    // Validar dados
    if (!file_name || !file_url) {
      return NextResponse.json(
        { error: 'Dados incompletos. Necessário: file_name, file_url' },
        { status: 400 }
      );
    }

    // Inserir registro na tabela tenant_agents_rag
    const { data, error } = await supabase
      .from('tenant_agents_rag')
      .insert({
        file_name,
        file_url,
        status: 'pending',
        metadata,
        agent_id,
        tenant_id: tenantData.id // Adicionando tenant_id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar registro:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar informações do arquivo' },
        { status: 500 }
      );
    }

    // Retornar dados do registro criado
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro na API de knowledge-base:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Obter tenant_id do usuário autenticado
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (tenantError || !tenantData) {
      console.error('Erro ao obter tenant_id:', tenantError);
      return NextResponse.json({ error: 'Erro ao obter informações do tenant' }, { status: 500 });
    }
    
    // Obter agent_id da query string (opcional)
    const { searchParams } = new URL(request.url);
    const agent_id = searchParams.get('agent_id');

    // Buscar registros - filtrar por tenant_id e agent_id se fornecido
    let query = supabase
      .from('tenant_agents_rag')
      .select('*')
      .eq('tenant_id', tenantData.id) // Filtrar sempre por tenant_id
      .order('created_at', { ascending: false });
      
    // Aplicar filtro adicional por agent_id se fornecido
    if (agent_id) {
      query = query.eq('agent_id', agent_id);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar registros:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar informações dos arquivos' },
        { status: 500 }
      );
    }

    // Retornar dados
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro na API de knowledge-base:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter id do registro a ser excluído
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const file_path = searchParams.get('file_path');

    if (!id) {
      return NextResponse.json(
        { error: 'Parâmetro id é obrigatório' },
        { status: 400 }
      );
    }

    // Excluir registro do banco de dados
    const { error: dbError } = await supabase
      .from('tenant_agents_rag')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Erro ao excluir registro:', dbError);
      return NextResponse.json(
        { error: 'Erro ao excluir informações do arquivo' },
        { status: 500 }
      );
    }

    // Se tiver o caminho do arquivo, excluir do storage
    if (file_path) {
      try {
        const path = file_path.split('knowledge-base/')[1];
        if (path) {
          const { error: storageError } = await supabase.storage
            .from('knowledge-base')
            .remove([path]);
          
          if (storageError) {
            console.error('Erro ao excluir arquivo do storage:', storageError);
          }
        }
      } catch (storageError) {
        console.error('Erro ao processar exclusão do arquivo:', storageError);
        // Não falhar a operação se apenas o storage falhar
      }
    }

    // Retornar sucesso
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro na API de knowledge-base:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
