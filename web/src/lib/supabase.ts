import { createBrowserClient } from '@supabase/ssr';

// A função createClient é um wrapper para garantir que temos apenas uma instância do cliente.
// Isso é útil para evitar recriar o cliente em cada renderização de componente.
export function createClient() {
  // Em ambiente de navegador, preferimos ler do runtime public config injetado no layout
  // para evitar rebuild da imagem quando mudar as credenciais públicas.
  if (typeof window !== 'undefined') {
    const cfg = (window as any).__PUBLIC_CONFIG__ || {};
    const url = cfg.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = cfg.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      // Evita expor detalhes; mantém mensagem curta
      throw new Error('Supabase public config ausente no cliente.');
    }
    return createBrowserClient(url, anon);
  }

  // Em SSR/Edge, ainda podemos cair no env do processo
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Supabase public config ausente no servidor.');
  }
  return createBrowserClient(url, anon);
}
