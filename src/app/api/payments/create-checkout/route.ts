import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { decryptConfig } from '@/lib/crypto/config-encryption';

/**
 * Create Stripe Checkout Session for a PENDING order.
 * Requires STRIPE_SECRET_KEY or channel config apiKey.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: '缺少 orderId' }, { status: 400 });
    }

    let order: {
      id: string;
      userId: string;
      status: string;
      total: { toString(): string } | number;
    } | null = null;

    try {
      order = await prisma.order.findUnique({ where: { id: orderId } });
    } catch {
      return NextResponse.json(
        { error: '数据库未连接，无法创建支付' },
        { status: 503 }
      );
    }

    if (!order || order.userId !== session.userId) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: '订单状态不可支付' }, { status: 400 });
    }

    // Resolve Stripe secret: env first, then payment channel config
    let stripeSecret = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeSecret) {
      try {
        const channel = await prisma.paymentChannel.findUnique({
          where: { key: 'stripe' },
        });
        if (channel?.enabled && channel.configComplete) {
          const cfg = decryptConfig(channel.config);
          stripeSecret = cfg?.apiKey || '';
        }
      } catch {
        /* ignore */
      }
    }

    if (!stripeSecret) {
      return NextResponse.json(
        {
          error:
            'Stripe 未配置。请在环境变量设置 STRIPE_SECRET_KEY，或在后台启用并配置 stripe 通道。',
        },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';
    const amountCents = Math.round(Number(order.total) * 100);
    if (amountCents < 1) {
      return NextResponse.json({ error: '订单金额无效' }, { status: 400 });
    }

    // Minimal Stripe Checkout Session via REST (no stripe SDK dependency)
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${baseUrl}/orders?paid=1&orderId=${orderId}`);
    params.append('cancel_url', `${baseUrl}/orders?cancelled=1`);
    params.append('line_items[0][price_data][currency]', 'cny');
    params.append('line_items[0][price_data][product_data][name]', `订单 ${orderId.slice(0, 8)}`);
    params.append('line_items[0][price_data][unit_amount]', String(amountCents));
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[orderId]', orderId);
    params.append('client_reference_id', orderId);

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error('Stripe error', data);
      return NextResponse.json(
        { error: data.error?.message || '创建 Stripe 会话失败' },
        { status: 502 }
      );
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentChannel: 'stripe' },
      });
    } catch {
      /* non-fatal */
    }

    return NextResponse.json({ url: data.url, sessionId: data.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '创建支付失败' }, { status: 500 });
  }
}
