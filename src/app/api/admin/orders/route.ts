import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { logAdminAction } from '@/lib/audit-log';

const ALLOWED: Record<string, string[]> = {
  confirm_paid: ['PENDING'],
  ship: ['PAID'],
  complete: ['SHIPPED'],
  cancel: ['PENDING'],
};

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

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const { orderId, action, trackingNumber } = await req.json();
    if (!orderId || !action || !ALLOWED[action]) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (!ALLOWED[action].includes(order.status)) {
      return NextResponse.json(
        { error: `当前状态 ${order.status} 不能执行 ${action}` },
        { status: 400 }
      );
    }

    if (action === 'confirm_paid') {
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
    }

    if (action === 'ship') {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'SHIPPED',
          trackingNumber: trackingNumber ? String(trackingNumber) : order.trackingNumber,
          shippedAt: new Date(),
        },
      });
      await logAdminAction({
        adminId: session.userId,
        action: 'order.ship',
        targetType: 'order',
        targetId: orderId,
        detail: { trackingNumber: updated.trackingNumber },
        ip: req.headers.get('x-forwarded-for') ?? undefined,
      });
      return NextResponse.json(updated);
    }

    if (action === 'complete') {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });
      await logAdminAction({
        adminId: session.userId,
        action: 'order.complete',
        targetType: 'order',
        targetId: orderId,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
      });
      return NextResponse.json(updated);
    }

    if (action === 'cancel') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        });
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });
      await logAdminAction({
        adminId: session.userId,
        action: 'order.cancel',
        targetType: 'order',
        targetId: orderId,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
      });
      return NextResponse.json({ ok: true, status: 'CANCELLED' });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
