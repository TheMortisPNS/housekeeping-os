export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { DORM_ROOMS, HOUSES } from '@/lib/constants';

function escapeHtml(str: string | null | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generatePdfHtml(plan: any): string {
  const dormBeds = plan?.dormBeds ?? [];
  const roomStatuses = plan?.roomStatuses ?? [];
  const HOUSE_ORDER = [ "AKROPOLI",
  "VEIKOU", "ERMOU 1", "ERMOU 2", "ERMOU 3", "SOKRATOUS",
  "PETRATOS A4", "PETRATOS A2", "MILTIADOU",
  "VASO", "LOFT", "K44", "TRIGONO"
];

const houseStatuses = [...(plan?.houseStatuses ?? [])].sort((a, b) => {
  const ai = HOUSES.indexOf(a?.houseName ?? '');
  const bi = HOUSES.indexOf(b?.houseName ?? '');
  const aIdx = ai === -1 ? 999 : ai;
  const bIdx = bi === -1 ? 999 : bi;
  return aIdx - bIdx;
});
  const dateStr = plan?.date ? new Date(plan.date).toLocaleDateString('el-GR') : '';

  const dormByRoom: Record<string, any[]> = {};
  for (const bed of dormBeds) {
    const room = bed?.roomNumber ?? '';
    if (!dormByRoom[room]) dormByRoom[room] = [];
    dormByRoom[room].push(bed);
  }

  const roomOrder = Object.keys(DORM_ROOMS);

  // ROOMS
  let roomsRows = '';
  for (const rs of roomStatuses) {
    const status = rs?.status ?? 'empty';
    const statusLabel = status === 'empty' ? '' : status;
    roomsRows += `<tr>
      <td class="room-num">${escapeHtml(rs?.roomNumber)}</td>
      <td class="status-cell">${escapeHtml(statusLabel)}</td>
      <td>${escapeHtml(rs?.checkOutTime)}</td>
      <td>${escapeHtml(rs?.checkInTime)}</td>
      <td>${escapeHtml(rs?.notes)}</td>
    </tr>`;
  }

  // HOUSES
  let housesRows = '';
  for (const hs of houseStatuses) {
    housesRows += `<tr>
      <td class="house-name">${escapeHtml(hs?.houseName)}</td>
      <td>${hs?.inHouse ? '✓' : ''}</td>
      <td>${hs?.checkOut ? '✓' : ''}</td>
      <td>${escapeHtml(hs?.checkOutTime)}</td>
      <td>${hs?.checkOutTaxi ? '✓' : ''}</td>
      <td>${escapeHtml(hs?.checkOutBalance)}</td>
      <td>${hs?.checkIn ? '✓' : ''}</td>
      <td>${escapeHtml(hs?.checkInTime)}</td>
      <td>${hs?.checkInTaxi ? '✓' : ''}</td>
      <td>${escapeHtml(hs?.checkInBalance)}</td>
      <td>${escapeHtml(hs?.pax)}</td>
    </tr>`;
  }

  // DORMS
  // empty     => κενό
  // IN        => κείμενο "IN"
  // IN_CIRCLE => κύκλος (χωρίς κείμενο)
  // OUT       => κύκλος με "OUT"
  let dormsHtml = '';
  for (const roomNum of roomOrder) {
    const beds = dormByRoom[roomNum] ?? [];
    const expectedBeds = DORM_ROOMS[roomNum] ?? [];
    const maxBeds = 8;

    let bedCells = '';
    for (let i = 0; i < maxBeds; i++) {
      const label = expectedBeds[i];

      if (!label) {
        bedCells += `<td class="bed-cell bed-na"></td>`;
        continue;
      }

      const bed = beds.find((b: any) => b?.bedLabel === label);
      const status = bed?.status ?? 'empty';

      let symbolHtml = '';
      if (status === 'IN') {
        symbolHtml = `<div class="text-in">IN</div>`;
      } else if (status === 'IN_CIRCLE') {
        symbolHtml = `<div class="circle circle-plain"></div>`;
      } else if (status === 'OUT') {
        symbolHtml = `<div class="circle circle-out">OUT</div>`;
      }

      bedCells += `<td class="bed-cell">
        <div class="bed-label">${escapeHtml(label)}</div>
        ${symbolHtml ? `<div class="symbol-wrap">${symbolHtml}</div>` : ''}
      </td>`;
    }

    dormsHtml += `<div class="dorm-room">
      <div class="dorm-header">${escapeHtml(roomNum)}</div>
      <table class="dorm-table"><tr>${bedCells}</tr></table>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8" />
<style>
  @page { size: A4; margin: 8mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #000; background: #fff; }

  .page { page-break-after: always; padding: 3mm; }
  .page:last-child { page-break-after: auto; }

  .page-title {
    text-align: center; font-size: 22px; font-weight: 700;
    border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px;
    text-transform: uppercase; letter-spacing: 0.6px;
  }
  .page-subtitle { text-align: right; font-size: 15px; font-weight: 700; margin-bottom: 6px; }

  .section-title {
    font-size: 17px; font-weight: 700; color: #000;
    padding: 3px 0; margin: 8px 0 4px;
    border-bottom: 1.5px solid #000;
    text-transform: uppercase;
  }

  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  th, td {
    border: 1.5px solid #000;
    padding: 4px 5px;
    text-align: center;
    font-size: 14px;
    line-height: 1.15;
  }
  th { background: #f2f2f2; color: #000; font-weight: 700; }

  .room-num { font-weight: 700; text-align: left; background: #fafafa; width: 70px; font-size: 16px; }
  .house-name { font-weight: 700; text-align: left; background: #fafafa; font-size: 14px; white-space: nowrap; }
  .status-cell { font-weight: 700; font-size: 15px; }

  .houses-table th { font-size: 11px; padding: 4px 2px; }
  .houses-table td { font-size: 14px; padding: 4px 2px; }

  /* DORMS */
  .dorm-room { margin-bottom: 6px; break-inside: avoid; border: 1.5px solid #000; padding: 3px 5px; }
  .dorm-header { font-size: 18px; font-weight: 700; border-left: 5px solid #000; padding-left: 8px; margin-bottom: 3px; line-height: 1.15; }
  .dorm-table { width: 100%; table-layout: fixed; margin-bottom: 0; }
  .dorm-table td {
    border: 1.5px solid #000;
    width: 12.5%;
    height: 56px;
    vertical-align: top;
    text-align: center;
    position: relative;
    padding: 2px;
  }
  .bed-cell { position: relative; }
  .dorm-table td.bed-na {
    background: transparent;
    border: none;
  }
  .bed-label {
    font-size: 14px; font-weight: 700;
    display: block;
    border-bottom: 1px solid #999;
    margin-bottom: 2px;
    text-align: left;
    line-height: 1.1;
  }

  .symbol-wrap {
    position: absolute;
    top: 21px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    display: flex;
    justify-content: center;
  }

  /* IN text */
  .text-in {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.5px;
    line-height: 1.1;
  }

  /* Κύκλοι */
  .circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #000;
    background: transparent;
    color: #000;
    font-weight: 800;
    font-size: 11px;
    line-height: 1;
  }
  .circle-plain { font-size: 0; }
  .circle-out { letter-spacing: 0.3px; }
</style>
</head>
<body>
  <div class="page">
    <div class="page-title">MOSAIKON HOUSEKEEPING</div>
    <div class="page-subtitle">Ημερομηνία: ${escapeHtml(dateStr)}</div>

    <div class="section-title">ΔΩΜΑΤΙΑ (ROOMS)</div>
    <table>
      <thead><tr>
        <th>Δωμάτιο</th><th>Status</th><th>Check-out</th><th>Check-in</th>
        <th>Σημειώσεις</th>
      </tr></thead>
      <tbody>${roomsRows}</tbody>
    </table>

    <div class="section-title">ΔΙΑΜΕΡΙΣΜΑΤΑ (HOUSES)</div>
    <table class="houses-table">
      <thead>
        <tr>
          <th rowspan="2">Διαμέρισμα</th>
          <th rowspan="2">IN HOUSE</th>

          <th colspan="4">ΑΝΑΧΩΡΗΣΗ</th>
          <th colspan="4">ΑΦΙΞΗ</th>

          <th rowspan="2">PAX</th>
        </tr>
        <tr>
          <th>CHECK OUT</th>
          <th>Ώρα</th>
          <th>TAXI</th>
          <th>BALANCE</th>

          <th>CHECK IN</th>
          <th>Ώρα</th>
          <th>TAXI</th>
          <th>BALANCE</th>
        </tr>
      </thead>
      <tbody>${housesRows}</tbody>
    </table>
  </div>

  <div class="page">
    <div class="page-title">ΚΟΥΚΕΤΕΣ (DORMS)</div>
    <div class="page-subtitle">Ημερομηνία: ${escapeHtml(dateStr)}</div>
    ${dormsHtml}
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { planId } = body ?? {};
    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    const plan = await prisma.dailyPlan.findUnique({
      where: { id: planId },
      include: { dormBeds: true, roomStatuses: true, houseStatuses: true },
    });

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const htmlContent = generatePdfHtml(plan);

    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: htmlContent,
        pdf_options: {
          format: 'A4',
          margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
          print_background: true,
        },
        base_url: process.env.NEXTAUTH_URL ?? '',
      }),
    });

    if (!createResponse.ok) {
      return NextResponse.json({ error: 'PDF creation failed' }, { status: 500 });
    }

    const { request_id } = await createResponse.json();
    if (!request_id) return NextResponse.json({ error: 'No request ID' }, { status: 500 });

    let attempts = 0;
    while (attempts < 120) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, deployment_token: process.env.ABACUSAI_API_KEY }),
      });

      const statusResult = await statusResponse.json();
      const status = statusResult?.status ?? 'FAILED';

      if (status === 'SUCCESS') {
        const pdfData = statusResult?.result?.result;
        if (pdfData) {
          const pdfBuffer = Buffer.from(pdfData, 'base64');
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="housekeeping-plan.pdf"',
            },
          });
        }
        return NextResponse.json({ error: 'No PDF data' }, { status: 500 });
      }

      if (status === 'FAILED') {
        return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
      }

      attempts++;
    }

    return NextResponse.json({ error: 'Timeout' }, { status: 500 });
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
