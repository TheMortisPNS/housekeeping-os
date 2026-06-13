export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any)?.role !== 'admin' && (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name } = body ?? {};

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Όλα τα πεδία είναι υποχρεωτικά' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Ο χρήστης υπάρχει ήδη' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Αποτυχία εγγραφής' }, { status: 500 });
  }
}