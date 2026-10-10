import { createServerSupabaseClient } from './lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/register', '/auth/callback', '/api'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Rutas de admin - requieren autenticación + rol admin
  if (pathname.startsWith('/admin')) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar rol admin (opcional: se puede hacer en cada página)
    // const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    // if (profile?.role !== 'admin') {
    //   return NextResponse.redirect(new URL('/', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register',
    '/auth/callback',
  ],
};