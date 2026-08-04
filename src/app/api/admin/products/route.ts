import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { logAdminAction } from '@/lib/audit-log';

async function requireAdmin(req: NextRequest) {
  const s = await getSessionUser(req);
  if (!s || s.role !== 'ADMIN') return null;
  return s;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(
      products.map((p) => ({
        ...p,
        price: Number(p.price),
      }))
    );
  } catch {
    return NextResponse.json({ error: '数据库不可用' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const price = Number(body.price);
    const stock = Number(body.stock ?? 0);
    if (!title || !description || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: '标题、描述、价格必填' }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0,
        imageUrl: body.imageUrl || null,
        published: body.published !== false,
        visibility: body.visibility || 'public',
      },
    });
    await logAdminAction({
      adminId: session.userId,
      action: 'product.create',
      targetType: 'product',
      targetId: product.id,
      detail: { title },
      ip: req.headers.get('x-forwarded-for') ?? undefined,
    });
    return NextResponse.json({ ...product, price: Number(product.price) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
