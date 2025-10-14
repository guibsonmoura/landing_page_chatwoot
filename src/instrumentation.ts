export async function register() {
  // Attach diagnostics outside production OR when explicitly enabled
  const enabled = process.env.NODE_ENV !== 'production' || process.env.DIAG_DEBUG === '1';
  if (!enabled) return;

  const installed = (global as any).__diag_installed__;
  if (installed) return;
  (global as any).__diag_installed__ = true;

  // Startup env presence (no secrets printed)
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // eslint-disable-next-line no-console
    console.error('[diag:start]', {
      nodeEnv: process.env.NODE_ENV,
      diagDebug: process.env.DIAG_DEBUG === '1',
      supabaseUrlPresent: !!SUPABASE_URL,
      supabaseAnonPresent: !!SUPABASE_ANON_KEY,
    });
  } catch {}

  // Only register process handlers in Node.js environment (not in browser/edge runtime)
  if (typeof process !== 'undefined' && process.on) {
    process.on('unhandledRejection', (reason: any, promise) => {
      // eslint-disable-next-line no-console
      console.error('[unhandledRejection]', {
        reason: reason instanceof Error
          ? {
              message: reason.message,
              stack:
                process.env.DIAG_DEBUG === '1' || process.env.NODE_ENV !== 'production'
                  ? reason.stack
                  : '[REDACTED]',
              name: reason.name,
            }
          : reason,
      });
    });

    process.on('uncaughtException', (err: any) => {
      // eslint-disable-next-line no-console
      console.error('[uncaughtException]', {
        message: err?.message,
        stack:
          process.env.DIAG_DEBUG === '1' || process.env.NODE_ENV !== 'production'
            ? err?.stack
            : '[REDACTED]',
        name: err?.name,
      });
    });
  }
}
