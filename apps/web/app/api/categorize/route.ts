import { createServerSupabaseClient } from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  categorizeInputSchema,
  categorizeOutputSchema,
  type CategorizeInput,
  type CategorizeOutput,
  callCategorizationWithFallback,
  logCategorization,
} from '@ticketscan/ai';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  // Validate input with Zod
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const inputValidation = categorizeInputSchema.safeParse(body);
  if (!inputValidation.success) {
    logCategorization('warn', 'Invalid input for categorization', {
      requestId,
      userId: user.id,
      error: inputValidation.error.message,
    });
    return NextResponse.json(
      { ok: false, error: 'Datos de entrada inválidos', details: inputValidation.error.flatten() },
      { status: 400 }
    );
  }

  const { ticket_id, items } = inputValidation.data;

  // Verify ticket belongs to user
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id')
    .eq('id', ticket_id)
    .eq('user_id', user.id)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ ok: false, error: 'Ticket no encontrado' }, { status: 404 });
  }

  // Get prompt version from query param or default to v2
  const url = new URL(request.url);
  const version = url.searchParams.get('version') || 'v2';

  try {
    logCategorization('info', 'Starting categorization request', {
      requestId,
      userId: user.id,
      ticketId: ticket_id,
      itemCount: items.length,
      version,
    });

    const result = await callCategorizationWithFallback(
      supabase,
      items,
      requestId,
      user.id,
      ticket_id,
      version
    );

    // Validate output with Zod
    const outputValidation = categorizeOutputSchema.safeParse(result.data);
    if (!outputValidation.success) {
      logCategorization('error', 'Invalid output from provider', {
        requestId,
        userId: user.id,
        ticketId: ticket_id,
        provider: result.provider,
        model: result.model,
        error: outputValidation.error.message,
      });
      return NextResponse.json(
        { ok: false, error: 'Respuesta inválida del proveedor' },
        { status: 500 }
      );
    }

    // Upsert categorized items
    const updates = outputValidation.data.map((categorizedItem: CategorizeOutput[number], index: number) => ({
      ticket_id,
      nombre: items[index].nombre,
      cantidad: items[index].cantidad,
      precio: items[index].precio,
      categoria: categorizedItem.categoria,
      subcategoria: categorizedItem.subcategoria ?? null,
    }));

    const { error: insertError } = await supabase
      .from('ticket_items')
      .upsert(updates, { onConflict: 'ticket_id,nombre' });

    if (insertError) {
      logCategorization('error', 'Failed to insert categorized items', {
        requestId,
        userId: user.id,
        ticketId: ticket_id,
        error: insertError.message,
      });
      // Don't fail the request, items are still returned
    }

    const totalLatencyMs = Date.now() - startTime;

    logCategorization('info', 'Categorization completed', {
      requestId,
      userId: user.id,
      ticketId: ticket_id,
      provider: result.provider,
      model: result.model,
      version: result.version,
      itemCount: result.data.length,
      latencyMs: totalLatencyMs,
      cost: result.cost,
    });

    return NextResponse.json({
      ok: true,
      data: result.data,
      meta: {
        provider: result.provider,
        model: result.model,
        version: result.version,
        latencyMs: totalLatencyMs,
        cost: result.cost,
      },
    });
  } catch (error) {
    const totalLatencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    logCategorization('error', 'Categorization failed', {
      requestId,
      userId: user.id,
      ticketId: ticket_id,
      version,
      latencyMs: totalLatencyMs,
      error: errorMessage,
    });

    return NextResponse.json(
      { ok: false, error: 'Error en categorización', details: errorMessage },
      { status: 500 }
    );
  }
}