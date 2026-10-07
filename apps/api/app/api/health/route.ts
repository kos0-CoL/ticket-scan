import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { sql } from 'drizzle-orm';

// GET /api/health — diagnóstico de runtime:
// reporta SOLO la presencia de cada env var (nunca valores) y una consulta real a la DB.
export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    AI_ENCRYPTION_KEY: !!process.env.AI_ENCRYPTION_KEY,
  };

  let dbOk = false;
  let dbError: string | null = null;
  try {
    await db.execute(sql`select 1`);
    dbOk = true;
  } catch (e: any) {
    // Los mensajes de error de pg no incluyen contraseñas; recortamos por seguridad.
    dbError = String(e?.message ?? e).slice(0, 200);
  }

  return NextResponse.json({
    ok: dbOk,
    env,
    db: { ok: dbOk, error: dbError },
    node: process.version,
  });
}
