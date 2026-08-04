import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Stripe webhook endpoint.
 * In production: verify signature with STRIPE_WEBHOOK_SECRET and raw body.
 * This skeleton updates order status on payment_intent.succeeded.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  // Without Stripe SDK configured, accept a simplified demo payload for local testing:
  // { "type": "payment_intent.succeeded", "data": { "object": { "metadata": { "orderId": "..." } } } }
  try {
    let orderId: string | null = null;
    let status: 'succeeded' | 'failed' | null = null;

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && signature) {
      // Real verification would use stripe.webhooks.constructEvent(rawBody, signature, secret)
      // Keeping skeleton so project builds without stripe package installed by default.
      const event = JSON.parse(rawBody);
      if (event.type === 'payment_intent.succeeded') {
        orderId = event.data?.object?.metadata?.orderId ?? null;
        status = 'succeeded';
      } else if (event.type === 'payment_intent.payment_failed') {
        orderId = event.data?.object?.metadata?.orderId ?? null;
        status = 'failed';
      }
    } else {
      // Dev / demo path
      const event = JSON.parse(rawBody);
      if (event.type === 'payment_intent.succeeded') {
        orderId = event.data?.object?.metadata?.orderId ?? event.orderId ?? null;
        status = 'succeeded';
      }
    }

    if (!orderId || status !== 'succeeded') {
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
