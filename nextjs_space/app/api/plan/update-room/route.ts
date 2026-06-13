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
    const { id, status, checkOutTime, checkInTime, notes, cleanerName } = body ?? {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (checkOutTime !== undefined) data.checkOutTime = checkOutTime;
    if (checkInTime !== undefined) data.checkInTime = checkInTime;
    if (notes !== undefined) data.notes = notes;
    if (cleanerName !== undefined) data.cleanerName = cleanerName;

    const updated = await prisma.roomStatus.update({ where: { id }, data });
    return NextResponse.json({ success: true, room: updated });
  } catch (error: any) {
    console.error('Update room error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}