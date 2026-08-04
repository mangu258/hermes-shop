import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

/** Merge localStorage cart into server cart after login */
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { localItems } = await req.json();
    if (!Array.isArray(localItems)) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    for (const item of localItems) {
      if (!item.productId || !item.quantity) continue;
      await prisma.cartItem.upsert({
        where: {
          userId_productId: { userId: session.userId, productId: item.productId },
        },
        update: { quantity: { increment: item.quantity } },
        create: {
          userId: session.userId,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '合并失败' }, { status: 500 });
  }
}
