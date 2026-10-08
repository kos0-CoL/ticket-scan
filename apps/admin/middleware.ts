import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Redirect to login if no session
  if (!session) {
    // La URL real de app/(auth)/login/page.tsx es /login — los route groups
    // (auth) no aparecen en la URL. Redirigir a /(auth)/login causaría un
    // bucle infinito: esa ruta no existe, el 404 vuelve a pasar por el
    // middleware y éste redirige de nuevo.
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Solo cuentas de la allowlist ADMIN_EMAILS acceden al panel. Cualquier
  // otra cuenta (signup con Google de un tercero, por ejemplo) va al
  // dashboard de usuarios. Fail-closed: sin ADMIN_EMAILS nadie pasa.
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const email = session.user.email?.toLowerCase() ?? '';
  if (!email || !admins.includes(email)) {
    const dashboard = process.env.DASHBOARD_URL;
    // Sin dashboard configurado tampoco se deja pasar: se va al login.
    if (dashboard) return NextResponse.redirect(dashboard);
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'no-admin');
    return NextResponse.redirect(loginUrl);
  }

  // TODO: check admin role (custom claim or admins table)

  return res;
}

export const config = {
  // 'login' debe excluirse: si el middleware redirige /login a /login
  // (no hay sesión todavía), se crea un bucle de redirecciones infinito.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
