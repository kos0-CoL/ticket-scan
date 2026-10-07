import { NextResponse } from 'next/server';
import { extractTicket } from '@ticketscan/ai';

// POST /api/process
export async function POST(req: Request) {
  const body = await req.json();
  const { imageUrl } = body;

  if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });

  try {
    const ticket = await extractTicket(imageUrl);
    return NextResponse.json(ticket, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
