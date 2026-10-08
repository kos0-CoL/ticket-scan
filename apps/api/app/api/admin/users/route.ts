import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin, isAdminResponse } from '../../../../lib/admin-auth';

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

// GET /api/admin/users — lista usuarios (incluye app_metadata para el rol)
export async function GET() {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { data, error } = await getSupabase().auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.users);
}

// POST /api/admin/users — crear usuario (opcionalmente con acceso al admin)
// Body: { email, password, isAdmin? }
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { email, password, isAdmin } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'email y password son requeridos' }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
  }

  const { data, error } = await getSupabase().auth.admin.createUser({
    email: String(email).trim().toLowerCase(),
    password: String(password),
    email_confirm: true,
    ...(isAdmin ? { app_metadata: { role: 'admin' } } : {}),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(
    { id: data.user.id, email: data.user.email, isAdmin: !!isAdmin },
    { status: 201 }
  );
}

// PUT /api/admin/users — alternar el rol admin de un usuario existente
// Body: { id, isAdmin }
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { id, isAdmin } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const { data: current, error: fetchError } = await getSupabase().auth.admin.getUserById(id);
  if (fetchError || !current.user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  // Copia los app_metadata existentes y agrega/quita el rol.
  const appMetadata: Record<string, any> = { ...(current.user.app_metadata ?? {}) };
  if (isAdmin) appMetadata.role = 'admin';
  else delete appMetadata.role;

  const { error: updateError } = await getSupabase().auth.admin.updateUserById(id, {
    app_metadata: appMetadata,
  });
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ id, isAdmin: !!isAdmin });
}

// DELETE /api/admin/users — borrar usuario
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await getSupabase().auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
