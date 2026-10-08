import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function redirectTo(origin: string, path: string) {
  return NextResponse.redirect(new URL(path, origin));
}

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const providerError =
    requestUrl.searchParams.get('error_description') ||
    requestUrl.searchParams.get('error');

  // Error devuelto por Supabase en el redirect (state inválido, allowlist, etc.)
  if (providerError) {
    return redirectTo(requestUrl.origin, `/api/auth/session?error=${encodeURIComponent(providerError)}`);
  }

  if (!code) {
    return redirectTo(requestUrl.origin, '/api/auth/session?error=missing_code');
  }

  // Cliente con cookies REALES: el intercambio del código persiste la sesión
  // en cookies de la respuesta (antes eran un no-op y la sesión se perdía).
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (setCookies) => {
          for (const { name, value, options } of setCookies) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Antes el error se tragaba en silencio y se redirigía como si hubiera ido bien.
    return redirectTo(requestUrl.origin, `/api/auth/session?error=${encodeURIComponent(error.message)}`);
  }

  return redirectTo(requestUrl.origin, '/api/auth/session');
}
