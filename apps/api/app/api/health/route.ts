import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function checkDb(): Promise<{ ok: boolean; error?: string }> {
  try {
    await db.execute(sql`select 1`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function checkAnonKeyValid(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return false;
    // Llamada de auth sin efectos: credenciales inventadas.
    // Clave inválida -> 401 con "Invalid API key". Clave válida -> cualquier otro estado.
    const r = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sonda-salud@test.com', password: 'x' }),
      cache: 'no-store',
    });
    const text = await r.text();
    if (r.status === 401 && text.includes('Invalid API key')) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const [anonValid, dbCheck] = await Promise.all([checkAnonKeyValid(), checkDb()]);
  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      AI_ENCRYPTION_KEY: !!process.env.AI_ENCRYPTION_KEY,
    },
    supabase: { anon_key_valid: anonValid },
    db: dbCheck,
    ts: new Date().toISOString(),
  });
}
