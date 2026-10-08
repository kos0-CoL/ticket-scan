import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { tickets } from '@ticketscan/db/schema';
import { sql } from 'drizzle-orm';

// GET /api/monitoring - Public health check endpoint
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const check = searchParams.get('check'); // 'db' | 'full' | default basic

  const timestamp = new Date().toISOString();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-beta';
  const commit = process.env.VERCEL_GITHUB_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown';

  // Basic health check (no DB)
  if (!check || check === 'basic') {
    return NextResponse.json({
      status: 'ok',
      service: 'ticketscan-api',
      version,
      commit,
      timestamp,
      uptime: process.uptime(),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'basic',
      },
    });
  }

  // Database connectivity check
  if (check === 'db') {
    try {
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      const latency = Date.now() - start;

      return NextResponse.json({
        status: 'ok',
        service: 'ticketscan-api',
        version,
        commit,
        timestamp,
        database: {
          connected: true,
          latencyMs: latency,
        },
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'db',
        },
      });
    } catch (error) {
      return NextResponse.json({
        status: 'degraded',
        service: 'ticketscan-api',
        version,
        commit,
        timestamp,
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }, {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'db',
        },
      });
    }
  }

  // Full health check (DB + recent activity)
  if (check === 'full') {
    try {
      const dbStart = Date.now();
      await db.execute(sql`SELECT 1`);
      const dbLatency = Date.now() - dbStart;

      // Check recent tickets (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recentTickets = await db
        .select({ count: sql<number>`count(*)` })
        .from(tickets)
        .where(sql`${tickets.created_at} >= ${oneHourAgo}`);

      const ticketCount = Number(recentTickets[0]?.count ?? 0);

      // Check disk/memory (Node process)
      const memUsage = process.memoryUsage();
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      };

      return NextResponse.json({
        status: 'ok',
        service: 'ticketscan-api',
        version,
        commit,
        timestamp,
        uptime: process.uptime(),
        database: {
          connected: true,
          latencyMs: dbLatency,
        },
        activity: {
          ticketsLastHour: ticketCount,
        },
        resources: {
          memoryMB: memUsageMB,
          cpu: process.cpuUsage(),
        },
        node: process.version,
        platform: process.platform,
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'full',
        },
      });
    } catch (error) {
      return NextResponse.json({
        status: 'degraded',
        service: 'ticketscan-api',
        version,
        commit,
        timestamp,
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }, {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'full',
        },
      });
    }
  }

  // Unknown check type
  return NextResponse.json({
    status: 'error',
    error: `Unknown check type: ${check}. Use: basic, db, or full`,
    validChecks: ['basic', 'db', 'full'],
  }, {
    status: 400,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}