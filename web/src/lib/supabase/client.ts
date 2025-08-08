// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Cria um cliente Supabase no navegador com as credenciais do projeto.
  // As variáveis de ambiente são seguras para serem expostas no lado do cliente.
  // Preferir config injetada em runtime (window.__PUBLIC_CONFIG__) para evitar rebuilds
  const cfg = (typeof window !== 'undefined' && (window as any).__PUBLIC_CONFIG__) || {};
  const url = cfg.supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = cfg.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient(url!, anon!);
}
