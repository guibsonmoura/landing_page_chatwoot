import { NextResponse } from 'next/server';

// Runtime diagnostic endpoint: DOES NOT expose secrets values, only presence/shape.
// Use this to confirm env wiring inside the container without leaking keys.
export const runtime = 'nodejs';

export async function GET() {
  try {
    const env = process.env;
    const fields = [
      'SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'OPENAI_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'WEBHOOK_URL',
      'WEBHOOK_API_KEY',
      'WHATSAPP_STATUS_CHECK_INTERVAL',
      'NODE_ENV',
      'LOG_LEVEL',
    ];

    const envPresence: Record<string, { present: boolean; length?: number }> = {};
    for (const k of fields) {
      const v = (env as any)[k];
      envPresence[k] = v ? { present: true, length: typeof v === 'string' ? v.length : undefined } : { present: false };
    }

    const publicConfig = {
      supabaseUrl: env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? null,
      supabaseAnonKey: env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
    };

    return NextResponse.json({ ok: true, envPresence, publicConfig }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
