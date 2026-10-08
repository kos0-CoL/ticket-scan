import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { landingSections } from '@ticketscan/db/schema';
import { eq, asc } from 'drizzle-orm';

interface LandingSection {
  key: string;
  title: string;
  content: Record<string, any>;
  enabled: boolean;
  sort_order: number;
}

export async function GET() {
  try {
    const sections = await db
      .select()
      .from(landingSections)
      .where(eq(landingSections.enabled, true))
      .orderBy(asc(landingSections.sort_order));

    // Transformar a formato que espera el frontend
    const config = (sections as unknown as LandingSection[]).reduce((acc, section) => {
      acc[section.key] = {
        ...section.content,
        enabled: section.enabled,
        title: section.title,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ ok: true, config }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('GET /api/landing error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load landing config' }, { status: 500 });
  }
}