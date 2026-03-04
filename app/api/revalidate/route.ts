import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  revalidateTag('health-data');
  revalidatePath('/3040');
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
