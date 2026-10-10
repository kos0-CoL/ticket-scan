import { createServerSupabaseClient } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Solo administradores' }, { status: 403 });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('users')
    .select('*, profiles(full_name)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Obtener conteo de tickets y gasto total por usuario
  const usersWithStats = await Promise.all(
    (data || []).map(async (u: any) => {
      const { count: ticketCount } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', u.id);

      const { data: tickets } = await supabase
        .from('tickets')
        .select('total')
        .eq('user_id', u.id);

      const totalSpent = tickets?.reduce((sum: number, t: any) => sum + Number(t.total), 0) || 0;

      return {
        ...u,
        full_name: u.profiles?.full_name || null,
        ticket_count: ticketCount || 0,
        total_spent: totalSpent,
      };
    })
  );

  return NextResponse.json({
    ok: true,
    data: usersWithStats,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
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
  const { email, full_name, role } = body;

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 });
  }

  // Crear usuario en auth (requiere service role key para admin)
  // Por ahora solo creamos el perfil, el usuario debe registrarse primero
  return NextResponse.json({ ok: false, error: 'Use Supabase Auth para crear usuarios' }, { status: 400 });
}