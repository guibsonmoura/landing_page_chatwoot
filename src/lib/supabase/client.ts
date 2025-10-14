
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  
  const cfg = (typeof window !== 'undefined' && (window as any).__PUBLIC_CONFIG__) || {};
  const url = cfg.supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = cfg.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient(url!, anon!);
}
