// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import logger from '@/lib/logger';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  // Diagnostic bypass: when enabled, skip any Supabase auth logic to avoid Edge env issues
  if (process.env.DIAG_DEBUG === '1') {
    logger.warn('Middleware: DIAG_DEBUG enabled, bypassing all middleware logic');
    return res;
  }

  // Skip auth for health/diag endpoints and all API routes to avoid interfering with server diagnostics
  const path = req.nextUrl.pathname;
  if (path.startsWith('/api/diag') || path.startsWith('/api/health') || path.startsWith('/api/')) {
    return res;
  }

  // Resolve Supabase env with fallbacks to support runtime injection strategy
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // If we cannot read envs (e.g., edge/middleware env restrictions), don't block the request
    logger.warn('Middleware: missing Supabase env, bypassing auth checks');
    return res;
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          // Se o middleware precisar definir um cookie, ele modifica o request e o response
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          // Se o middleware precisar remover um cookie, ele modifica o request e o response
          req.cookies.set({ name, value: '', ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  logger.debug('Middleware processing request', { path: req.nextUrl.pathname });

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    logger.debug('User authenticated', { hasUser: true });
    // Se o usuário está logado e tenta acessar a página de login, redireciona para o dashboard
    if (req.nextUrl.pathname.startsWith('/login')) {
      logger.debug('Redirecting authenticated user to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  } else {
    logger.debug('No authenticated user found');
    // Se o usuário não está logado e tenta acessar o dashboard, redireciona para o login
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      logger.debug('Redirecting unauthenticated user to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  logger.debug('No redirect needed');
  return res;
}

// Configuração atualizada para aplicar o middleware de forma mais abrangente
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (all API routes are excluded)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
