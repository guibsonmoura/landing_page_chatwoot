// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import logger from '@/lib/logger';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
