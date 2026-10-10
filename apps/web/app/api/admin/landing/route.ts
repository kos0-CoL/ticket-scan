import { createServerSupabaseClient } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Solo administradores' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('landing_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Solo administradores' }, { status: 403 });
  }

  const body = await request.json();
  const { key, title, enabled, sort_order, content } = body;

  if (!key || !title) {
    return NextResponse.json({ ok: false, error: 'Clave y título requeridos' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('landing_sections')
    .insert({
      key,
      title,
      enabled: enabled ?? true,
      sort_order: sort_order || 0,
      content: content || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}