import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente perezoso: crearlo a nivel de módulo rompe `next build` si las env vars aún no existen.
let supabase: SupabaseClient | undefined;
function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// GET /api/admin/users
export async function GET() {
  const { data, error } = await getSupabase().auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.users);
}
