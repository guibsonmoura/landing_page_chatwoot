import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Usando a forma correta de acessar cookies
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore
  });

  // Verificar se o usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Verificar se o bucket 'rag' existe
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      return NextResponse.json({ error: 'Erro ao listar buckets' }, { status: 500 });
    }

    const ragBucket = buckets.find(bucket => bucket.name === 'rag');

    // Se o bucket não existir, criar
    if (!ragBucket) {
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('rag', {
          public: true, // Permitir acesso público aos arquivos
          fileSizeLimit: 52428800, // 50MB em bytes
        });

      if (createError) {
        return NextResponse.json({ error: 'Erro ao criar bucket rag' }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'Bucket rag criado com sucesso', 
        bucket: newBucket 
      });
    }

    return NextResponse.json({ 
      message: 'Bucket rag já existe', 
      bucket: ragBucket 
    });
  } catch (error: any) {
    console.error('Erro ao verificar/criar bucket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
