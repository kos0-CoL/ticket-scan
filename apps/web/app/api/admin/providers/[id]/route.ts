import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
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

  const { data, error } = await supabase
    .from('ml_providers')
    .select('*, ml_configs(*)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Proveedor no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data });
}

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
  const { name, default_model, fallback_order, is_active, api_key } = body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (default_model !== undefined) updateData.default_model = default_model;
  if (fallback_order !== undefined) updateData.fallback_order = fallback_order;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (api_key !== undefined) updateData.api_key_encrypted = api_key;

  const { data, error } = await supabase
    .from('ml_providers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(
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

  const { error } = await supabase
    .from('ml_providers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}