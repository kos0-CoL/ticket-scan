import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/auth/session — sesión actual según las cookies de Supabase (sb-*-auth-token).
// 200 con { user } o { user: null }; nunca expone tokens.
export async function GET(req: NextRequest) {
  const authError = req.nextUrl.searchParams.get('error');
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

  // getUser valida el JWT contra Supabase (no confía solo en la cookie).
  const { data: { user }, error } = await supabase.auth.getUser();

  // "Sin sesión" no es un error: solo reportamos fallos reales de validación
  // (cookie corrupta, JWT vencido sin refresh, etc.) o los ?error= del flujo de login.
  const sessionMissing = !error || error.name === 'AuthSessionMissingError';

  return NextResponse.json(
    {
      user: user ? { id: user.id, email: user.email ?? null } : null,
      error: sessionMissing ? authError : (error.message ?? authError),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
