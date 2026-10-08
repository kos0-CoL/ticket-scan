import { NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { mlTrainingJobs } from '@ticketscan/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin, isAdminResponse } from '../../../../lib/admin-auth';

// GET /api/admin/ml-training-jobs - List training jobs
export async function GET() {
  const guard = await requireAdmin();
  if (isAdminResponse(guard)) return guard;

  const jobs = await db.select().from(mlTrainingJobs).orderBy(desc(mlTrainingJobs.created_at));
  return NextResponse.json(jobs);
}