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

// POST /api/upload
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const userId = formData.get('userId') as string | null;

  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await getSupabase().storage
    .from('tickets')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: publicUrl } = getSupabase().storage.from('tickets').getPublicUrl(path);

  return NextResponse.json({ path: data.path, url: publicUrl.publicUrl }, { status: 201 });
}
