import { createServerSupabaseClient } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*, ticket_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Ticket no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}