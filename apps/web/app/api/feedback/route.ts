import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { feedback_id, corrections, selected_for_training } = body;

  if (!feedback_id) {
    return NextResponse.json({ ok: false, error: 'feedback_id requerido' }, { status: 400 });
  }

  const updateData: Record<string, any> = {};
  if (corrections) updateData.user_corrections = corrections;
  if (selected_for_training !== undefined) updateData.selected_for_training = selected_for_training;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nada que actualizar' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('feedback_images')
    .update(updateData)
    .eq('id', feedback_id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('feedback_images')
    .select('*, tickets(comercio, fecha, total)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status === 'selected') {
    query = query.eq('selected_for_training', true);
  } else if (status === 'pending') {
    query = query.eq('selected_for_training', false);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}