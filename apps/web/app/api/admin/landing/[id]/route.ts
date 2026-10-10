import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Solo administradores' }, { status: 403 });
  }

  const body = await request.json();
  const { enabled, title, sort_order, content } = body;

  const updateData: any = {};
  if (enabled !== undefined) updateData.enabled = enabled;
  if (title !== undefined) updateData.title = title;
  if (sort_order !== undefined) updateData.sort_order = sort_order;
  if (content !== undefined) updateData.content = content;

  const { data, error } = await supabase
    .from('landing_sections')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}