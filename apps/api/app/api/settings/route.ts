import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { appConfig } from '@ticketscan/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/settings?userId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const config = await db
      .select()
      .from(appConfig)
      .where(eq(appConfig.key, `user_settings_${userId}`))
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json({});
    }

    return NextResponse.json(config[0].value);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

// POST /api/settings - Save user settings
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...settings } = body;

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const key = `user_settings_${userId}`;

    await db
      .insert(appConfig)
      .values({
        key,
        value: settings,
      })
      .onConflictDoUpdate({
        target: appConfig.key,
        set: { value: settings, updated_at: new Date() },
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}