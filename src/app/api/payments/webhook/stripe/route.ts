import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Stripe webhook: payment_intent.succeeded or checkout.session.completed → mark order PAID.
 * Production: verify signature with STRIPE_WEBHOOK_SECRET (raw body).
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  try {
    const event = JSON.parse(rawBody);
    let orderId: string | null = null;

    if (event.type === 'checkout.session.completed') {
      orderId =
        event.data?.object?.metadata?.orderId ||
        event.data?.object?.client_reference_id ||
        null;
    } else if (event.type === 'payment_intent.succeeded') {
      orderId = event.data?.object?.metadata?.orderId || null;
    } else if (event.orderId) {
      // local demo payload
      orderId = event.orderId;
    }

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return NextResponse.json({ error: '订单不存在' }, { status: 404 });
      }
      if (order.status === 'PAID') {
        return NextResponse.json({ received: true, already: true });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidVia: 'stripe',
          paidAt: new Date(),
        },
      });
    } catch {
      // DB not available
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('Stripe webhook error', e);
    return NextResponse.json({ error: '处理失败' }, { status: 400 });
  }
}
