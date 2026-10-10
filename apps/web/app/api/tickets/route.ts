import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const comercio = searchParams.get('comercio');
  const fechaDesde = searchParams.get('fecha_desde');
  const fechaHasta = searchParams.get('fecha_hasta');

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  let query = supabase
    .from('tickets')
    .select('*, ticket_items(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('fecha', { ascending: false });

  if (comercio) query = query.ilike('comercio', `%${comercio}%`);
  if (fechaDesde) query = query.gte('fecha', fechaDesde);
  if (fechaHasta) query = query.lte('fecha', fechaHasta);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    data,
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

  const body = await request.json();
  const { comercio, fecha, hora, total, fuente, imagen_url, sucursal, metodo_pago, items } = body;

  if (!comercio || !fecha || total === undefined) {
    return NextResponse.json({ ok: false, error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      user_id: user.id,
      comercio,
      fecha,
      hora,
      total,
      fuente: fuente || 'camera',
      imagen_url,
      sucursal,
      metodo_pago,
      status: 'completed',
    })
    .select()
    .single();

  if (ticketError) {
    return NextResponse.json({ ok: false, error: ticketError.message }, { status: 500 });
  }

  if (items && Array.isArray(items) && items.length > 0) {
    const ticketItems = items.map((item: any) => ({
      ticket_id: ticket.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      categoria: item.categoria,
      subcategoria: item.subcategoria,
    }));

    const { error: itemsError } = await supabase
      .from('ticket_items')
      .insert(ticketItems);

    if (itemsError) {
      console.error('Error inserting ticket items:', itemsError);
    }
  }

  return NextResponse.json({ ok: true, data: ticket }, { status: 201 });
}