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
    const { planId, pdfBase64 } = body ?? {};
    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    // Mark plan as finalized
    await prisma.dailyPlan.update({
      where: { id: planId },
      data: { finalized: true, finalizedAt: new Date() },
    });

    // Send email notification with PDF
    const appUrl = process.env.NEXTAUTH_URL ?? '';
    let appName = 'Mosaikon';
    try { appName = new URL(appUrl)?.hostname?.split('.')?.[0] ?? 'Mosaikon'; } catch {}

    const today = new Date().toLocaleDateString('el-GR');
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px;">
          Πλάνο Housekeeping - ${today}
        </h2>
        <p>Το πλάνο housekeeping για σήμερα έχει οριστικοποιηθεί.</p>
        <p>Το PDF είναι συνημμένο. Μπορείτε να το κατεβάσετε από την εφαρμογή.</p>
        <p style="color: #666; font-size: 12px;">Mosaikon Housekeeping</p>
      </div>
    `;

    try {
      const senderEmail = appUrl ? `noreply@${new URL(appUrl).hostname}` : 'noreply@mosaikon.app';
      await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_HOUSEKEEPING_PLAN_FINALIZED,
          subject: `Πλάνο Housekeeping - ${today}`,
          body: htmlBody,
          is_html: true,
          recipient_email: 'panosbhtip1@gmail.com',
          sender_email: senderEmail,
          sender_alias: 'Mosaikon Housekeeping',
        }),
      });
    } catch (emailError: any) {
      console.error('Email send error:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Finalize error:', error);
    return NextResponse.json({ error: 'Failed to finalize' }, { status: 500 });
  }
}
