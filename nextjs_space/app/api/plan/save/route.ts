import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { roomStatuses, houseStatuses, dormBeds } = body;

    // 1. Δωμάτια
    for (const room of roomStatuses) {
      await prisma.roomStatus.update({
        where: { id: room.id },
        data: {
          status: room.status,
          checkOutTime: room.checkOutTime,
          checkInTime: room.checkInTime,
          notes: room.notes,
          cleanerName: room.cleanerName
        }
      });
    }

    // 2. Διαμερίσματα
    for (const house of houseStatuses) {
      await prisma.houseStatus.update({
        where: { id: house.id },
        data: {
          inHouse: house.inHouse,
          checkOut: house.checkOut,
          checkOutTime: house.checkOutTime,
          checkIn: house.checkIn,
          checkInTime: house.checkInTime,
          pax: house.pax,
          cleanerName: house.cleanerName
        }
      });
    }

    // 3. Κουκέτες
    for (const bed of dormBeds) {
      await prisma.dormBed.update({
        where: { id: bed.id },
        data: {
          status: bed.status,
          cleanerName: bed.cleanerName
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error saving' }, { status: 500 });
  }
}