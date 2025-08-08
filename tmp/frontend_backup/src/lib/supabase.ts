import { createBrowserClient } from '@supabase/ssr';

// A função createClient é um wrapper para garantir que temos apenas uma instância do cliente.
// Isso é útil para evitar recriar o cliente em cada renderização de componente.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
