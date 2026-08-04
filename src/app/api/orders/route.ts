import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const items: { productId: string; quantity: number }[] = body.items || [];
    const paymentChannel: string | undefined = body.paymentChannel;
    const shippingAddress: string | undefined = body.shippingAddress;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: '购物车为空' }, { status: 400 });
    }

    // Try database path
    try {
      const productIds = items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, published: true },
      });

      if (products.length === 0) {
        // Fall through to demo mode
        throw new Error('NO_DB_PRODUCTS');
      }

      let total = 0;
      const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          return NextResponse.json({ error: `商品不存在: ${item.productId}` }, { status: 400 });
        }
        if (product.stock < item.quantity) {
          return NextResponse.json({ error: `库存不足: ${product.title}` }, { status: 400 });
        }
        const lineTotal = Number(product.price) * item.quantity;
        total += lineTotal;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: Number(product.price),
        });
      }

      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: session.userId,
            status: 'PENDING',
            total,
            paymentChannel: paymentChannel || null,
            shippingAddress: shippingAddress || null,
            items: { create: orderItemsData },
          },
          include: { items: true },
        });

        // Pre-deduct stock to prevent overselling
        for (const item of orderItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return created;
      });

      return NextResponse.json({
        id: order.id,
        total: Number(order.total),
        status: order.status,
        source: 'db',
      });
    } catch (dbErr: any) {
      // Demo fallback: simulate order without real DB
      let total = 0;
      for (const item of items) {
        const p = DEMO_PRODUCTS.find((d) => d.id === item.productId);
        if (!p) continue;
        if (p.stock < item.quantity) {
          return NextResponse.json({ error: `库存不足: ${p.title}` }, { status: 400 });
        }
        total += p.price * item.quantity;
      }

      if (total === 0) {
        return NextResponse.json({ error: '无效商品' }, { status: 400 });
      }

      return NextResponse.json({
        id: `demo-order-${Date.now()}`,
        total,
        status: 'PENDING',
        source: 'demo',
        message: '演示模式订单（未连接数据库）。配置 DATABASE_URL 后可创建真实订单并预扣库存。',
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders, source: 'db' });
  } catch {
    return NextResponse.json({ orders: [], source: 'demo' });
  }
}
