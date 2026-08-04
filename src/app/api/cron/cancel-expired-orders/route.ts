import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TIMEOUT_MINUTES = Number(process.env.ORDER_TIMEOUT_MINUTES || 30);

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');

  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> when configured;
  // also allow ?secret= for manual test
  if (secret) {
    const ok =
      auth === `Bearer ${secret}` || querySecret === secret;
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

  try {
    const expired = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoff },
      },
      include: { items: true },
    });

    let cancelled = 0;
    for (const order of expired) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });
      cancelled++;
    }

    return NextResponse.json({
      ok: true,
      cancelled,
      timeoutMinutes: TIMEOUT_MINUTES,
    });
  } catch (e) {
    console.error('cron cancel-expired', e);
    return NextResponse.json(
      { ok: false, error: 'DB unavailable or query failed', cancelled: 0 },
      { status: 200 }
    );
  }
}

// Allow POST for some cron runners
export async function POST(req: NextRequest) {
  return GET(req);
}
