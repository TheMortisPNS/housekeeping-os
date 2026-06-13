export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { DORM_ROOMS, PRIVATE_ROOMS, HOUSES } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams?.get('date') ?? new Date().toISOString().split('T')[0];
    const date = new Date(dateStr + 'T00:00:00.000Z');

    let plan = await prisma.dailyPlan.findUnique({
      where: { date },
      include: { dormBeds: true, roomStatuses: true, houseStatuses: true },
    });

    if (!plan) {
      // Create new plan with all beds/rooms/houses
      plan = await prisma.dailyPlan.create({
        data: {
          date,
          dormBeds: {
            create: Object.entries(DORM_ROOMS).flatMap(([room, beds]: [string, string[]]) =>
              beds?.map((bed: string) => ({ roomNumber: room, bedLabel: bed, status: 'empty' })) ?? []
            ),
          },
          roomStatuses: {
            create: PRIVATE_ROOMS?.map((room: string) => ({ roomNumber: room, status: 'empty' })) ?? [],
          },
          houseStatuses: {
            create: HOUSES?.map((house: string) => ({ houseName: house })) ?? [],
          },
        },
        include: { dormBeds: true, roomStatuses: true, houseStatuses: true },
      });
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('Get plan error:', error);
    return NextResponse.json({ error: 'Failed to get plan' }, { status: 500 });
  }
}
