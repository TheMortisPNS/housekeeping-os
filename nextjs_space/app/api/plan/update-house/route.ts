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
    const { id, ...fields } = body ?? {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const allowedFields = [
      'inHouse', 'checkOut', 'checkOutTime', 'checkOutTaxi', 'checkOutBalance',
      'checkIn', 'checkInTime', 'checkInTaxi', 'checkInBalance', 'pax', 'cleanerName'
    ];
    const data: any = {};
    for (const key of allowedFields) {
      if (fields[key] !== undefined) data[key] = fields[key];
    }

    const updated = await prisma.houseStatus.update({ where: { id }, data });
    return NextResponse.json({ success: true, house: updated });
  } catch (error: any) {
    console.error('Update house error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}