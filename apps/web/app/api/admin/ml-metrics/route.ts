import { createServerSupabaseClient } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Allow admin access for monitoring
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user?.id)
    .single();
  
  if (authError || !user || profile?.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
  const metricType = searchParams.get('type'); // optional filter

  let days = 7;
  if (period === '30d') days = 30;
  if (period === '90d') days = 90;

  const since = new Date();
  since.setDate(since.getDate() - days);

  let query = supabase
    .from('ml_metrics')
    .select('*, ml_providers(name)')
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: false });

  if (metricType) {
    query = query.eq('metric_type', metricType);
  }

  const { data, error } = await query.limit(1000);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Aggregate by day and type
  const aggregated = (data || []).reduce((acc: Record<string, any>, row: any) => {
    const day = row.recorded_at.split('T')[0];
    const key = `${day}_${row.metric_type}_${row.provider_id || 'unknown'}`;
    if (!acc[key]) {
      acc[key] = {
        day,
        metric_type: row.metric_type,
        provider: row.ml_providers?.name || row.provider_id || 'unknown',
        model_id: row.model_id,
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
      };
    }
    acc[key].count++;
    acc[key].sum += row.value;
    acc[key].min = Math.min(acc[key].min, row.value);
    acc[key].max = Math.max(acc[key].max, row.value);
    return acc;
  }, {});

  const result = Object.values(aggregated).map((row: any) => ({
    ...row,
    avg: Math.round((row.sum / row.count) * 10000) / 10000,
    sum: Math.round(row.sum * 100) / 100,
  }));

  return NextResponse.json({ ok: true, data: result });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { metric_type, provider_id, model_id, value, metadata } = body;

  if (!metric_type || value === undefined) {
    return NextResponse.json({ ok: false, error: 'metric_type y value requeridos' }, { status: 400 });
  }

  const { error } = await supabase
    .from('ml_metrics')
    .insert({
      metric_type,
      provider_id,
      model_id,
      value,
      metadata: metadata || {},
    });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}