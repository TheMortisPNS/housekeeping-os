export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status, cleanerName } = body ?? {};
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const data: any = { status };
    if (cleanerName !== undefined) data.cleanerName = cleanerName;

    const updated = await prisma.dormBed.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, bed: updated });
  } catch (error: any) {
    console.error('Update bed error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}