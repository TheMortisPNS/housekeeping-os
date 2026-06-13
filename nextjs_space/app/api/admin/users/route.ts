import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

function isAdmin(session: any): boolean {
  return session?.user?.role === 'admin' || session?.user?.role === 'ADMIN';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, name, email, password } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;

  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες' }, { status: 400 });
    }
    const bcrypt = await import('bcryptjs');
    data.password = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Δεν επιτρέπεται να διαγράψει τον εαυτό του
  if (id === (session.user as any).id) {
    return NextResponse.json({ error: 'Δεν μπορείς να διαγράψεις τον εαυτό σου' }, { status: 400 });
  }

  // Δεν επιτρέπεται να διαγράψει τον τελευταίο admin
  const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (targetUser?.role === 'admin' || targetUser?.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { role: { in: ['admin', 'ADMIN'] } },
    });
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Δεν μπορείς να διαγράψεις τον τελευταίο admin' }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}