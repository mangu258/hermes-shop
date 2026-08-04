import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ items: [], source: 'guest' });
  }

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
    });
    return NextResponse.json({ items, source: 'db' });
  } catch {
    return NextResponse.json({ items: [], source: 'demo' });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录以同步购物车到服务端' }, { status: 401 });
  }

  try {
    const { productId, quantity } = await req.json();
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: session.userId, productId },
      },
      update: { quantity: { increment: quantity } },
      create: { userId: session.userId, productId, quantity },
      include: { product: true },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: '购物车同步失败（请确保已配置 DATABASE_URL）' },
      { status: 503 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (productId) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.userId, productId },
      });
    } else {
      await prisma.cartItem.deleteMany({ where: { userId: session.userId } });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
