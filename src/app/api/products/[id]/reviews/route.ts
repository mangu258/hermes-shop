import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: params.id },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        ...r,
        user: {
          email: r.user.email.replace(/^(.{2}).+(@.+)$/, '$1***$2'),
        },
      })),
      avgRating: Math.round(avgRating * 10) / 10,
      total: reviews.length,
      source: 'db',
    });
  } catch {
    return NextResponse.json({
      reviews: [],
      avgRating: 0,
      total: 0,
      source: 'demo',
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { rating, comment } = await req.json();
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '评分必须在1-5之间' }, { status: 400 });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId: session.userId, productId: params.id },
      },
      update: { rating, comment },
      create: {
        productId: params.id,
        userId: session.userId,
        rating,
        comment,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '评价失败（请确保已配置数据库）' },
      { status: 503 }
    );
  }
}
