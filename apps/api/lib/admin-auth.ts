import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Guardia de las rutas /api/admin/*. Devuelve el email del usuario admin
 * autenticado, o un NextResponse con 401/403 que debe retornarse tal cual.
 *
 * Cómo obtiene la sesión: el admin (admin-ticket-ar) hace fetch relativo a
 * /api/*, que su next.config.js reescribe hacia este sitio — la petición
 * llega aquí con las cookies del navegador, así que la sesión Supabase se
 * lee igual que en el middleware del admin. Un acceso directo a este dominio
 * sin cookies no pasa (401).
 *
 * Admin = app_metadata.role === 'admin' (asignable desde /api/admin/users)
 * o email en la allowlist ADMIN_EMAILS (bootstrap del dueño).
 */
export async function requireAdmin(): Promise<string | NextResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const email = user.email?.toLowerCase() ?? '';
    const isRoleAdmin = (user.app_metadata as any)?.role === 'admin';
    const inAllowlist = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .includes(email);

    if (!isRoleAdmin && !inAllowlist) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    return email;
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

/** True si la guardia pasó; false si devolvió una respuesta de error. */
export function isAdminResponse(v: string | NextResponse): v is NextResponse {
  return v instanceof NextResponse;
}
