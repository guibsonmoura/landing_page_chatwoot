// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Cria um cliente Supabase no navegador com as credenciais do projeto.
  // As variáveis de ambiente são seguras para serem expostas no lado do cliente.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
