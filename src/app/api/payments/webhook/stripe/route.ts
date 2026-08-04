import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Verify Stripe-Signature header (v1 scheme) without stripe SDK.
 * https://stripe.com/docs/webhooks/signatures
 */
function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string
): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const [k, ...rest] = p.split('=');
      return [k.trim(), rest.join('=')];
    })
  ) as Record<string, string>;

  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  // Reject if timestamp older than 5 minutes
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    return false;
  }

  const signed = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');

  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function markPaid(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, reason: 'not_found' as const };
  if (order.status === 'PAID') return { ok: true, reason: 'already' as const };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      paidVia: 'stripe',
      paidAt: new Date(),
    },
  });
  return { ok: true, reason: 'updated' as const };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sigHeader = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  // Production: require valid signature when secret is configured
  if (webhookSecret) {
    const valid = verifyStripeSignature(rawBody, sigHeader, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    // In production without secret, refuse to avoid open webhook
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET not configured' },
      { status: 500 }
    );
  }
  // Dev without secret: allow unsigned payloads for local testing

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
      // local demo: { "orderId": "...", "type": "payment_intent.succeeded" }
      orderId = event.orderId;
    }

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    try {
      const result = await markPaid(orderId);
      if (!result.ok && result.reason === 'not_found') {
        return NextResponse.json({ error: '订单不存在' }, { status: 404 });
      }
      return NextResponse.json({
        received: true,
        orderId,
        status: result.reason,
      });
    } catch {
      return NextResponse.json({ received: true, db: false });
    }
  } catch (e) {
    console.error('Stripe webhook error', e);
    return NextResponse.json({ error: '处理失败' }, { status: 400 });
  }
}
