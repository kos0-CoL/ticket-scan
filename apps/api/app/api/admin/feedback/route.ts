import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ticketscan/db';
import { feedbackImages, mlTrainingJobs, eq } from '@ticketscan/db/schema';
import { desc, and, sql, inArray } from 'drizzle-orm';

// GET /api/admin/feedback - List feedback images with filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const selectedOnly = searchParams.get('selected') === 'true';
  const userId = searchParams.get('user_id');
  const offset = (page - 1) * limit;

  const conditions = [];
  if (selectedOnly) conditions.push(eq(feedbackImages.selected_for_training, true));
  if (userId) conditions.push(eq(feedbackImages.user_id, userId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [images, total] = await Promise.all([
    db.select().from(feedbackImages)
      .where(whereClause)
      .orderBy(desc(feedbackImages.created_at))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql`count(*)` }).from(feedbackImages).where(whereClause),
  ]);

  return NextResponse.json({
    images,
    pagination: {
      page,
      limit,
      total: Number(total[0]?.count || 0),
      totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
    },
  });
}

// POST /api/admin/feedback - Bulk update selected_for_training
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { image_ids, selected_for_training } = body;

  if (!Array.isArray(image_ids) || typeof selected_for_training !== 'boolean') {
    return NextResponse.json({ error: 'image_ids (array) y selected_for_training (boolean) requeridos' }, { status: 400 });
  }

  await db.update(feedbackImages)
    .set({ selected_for_training, updated_at: new Date() })
    .where(inArray(feedbackImages.id, image_ids));

  return NextResponse.json({ ok: true, updated: image_ids.length });
}

// PUT /api/admin/feedback - Create training job with selected percentage
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { feedback_percentage } = body;

  if (!feedback_percentage || feedback_percentage < 0 || feedback_percentage > 100) {
    return NextResponse.json({ error: 'feedback_percentage requerido (0-100)' }, { status: 400 });
  }

  // Get all selected images count
  const selectedImages = await db.select({ id: feedbackImages.id })
    .from(feedbackImages)
    .where(eq(feedbackImages.selected_for_training, true));

  const totalSelected = selectedImages.length;
  const imagesToUse = Math.floor(totalSelected * feedback_percentage / 100);

  if (imagesToUse === 0) {
    return NextResponse.json({ error: 'No hay suficientes imágenes seleccionadas para ese porcentaje' }, { status: 400 });
  }

  // Create training job
  const version = `v${Date.now()}`;
  const [job] = await db.insert(mlTrainingJobs).values({
    model_version: version,
    feedback_percentage,
    images_count: imagesToUse,
    status: 'pending',
  }).returning();

  // Mark first N images as assigned to this job
  const imagesForJob = selectedImages.slice(0, imagesToUse);
  for (const img of imagesForJob) {
    await db.update(feedbackImages)
      .set({ training_job_id: job.id, updated_at: new Date() })
      .where(eq(feedbackImages.id, img.id));
  }

  return NextResponse.json({
    ok: true,
    job: {
      id: job.id,
      version,
      feedback_percentage,
      images_count: imagesToUse,
      status: job.status,
    },
  });
}