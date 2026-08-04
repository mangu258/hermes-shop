import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { logAdminAction } from '@/lib/audit-log';

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: { select: { title: true } } } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json([]);
  }
}

/** Manual confirm payment for qrcode/manual channels */
export async function PATCH(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const { orderId, action } = await req.json();
    if (!orderId || action !== 'confirm_paid') {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: '仅待支付订单可确认收款' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paidVia: order.paymentChannel || 'manual',
      },
    });

    await logAdminAction({
      adminId: session.userId,
      action: 'order.confirm_paid',
      targetType: 'order',
      targetId: orderId,
      detail: { total: Number(order.total) },
      ip: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
