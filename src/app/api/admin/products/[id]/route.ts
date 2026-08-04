import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { logAdminAction } from '@/lib/audit-log';

async function requireAdmin(req: NextRequest) {
  const s = await getSessionUser(req);
  if (!s || s.role !== 'ADMIN') return null;
  return s;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.title != null) data.title = String(body.title).trim();
    if (body.description != null) data.description = String(body.description).trim();
    if (body.price != null) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: '价格无效' }, { status: 400 });
      }
      data.price = price;
    }
    if (body.stock != null) {
      const stock = Number(body.stock);
      if (!Number.isFinite(stock) || stock < 0) {
        return NextResponse.json({ error: '库存无效' }, { status: 400 });
      }
      data.stock = Math.floor(stock);
    }
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
    if (body.published !== undefined) data.published = !!body.published;
    if (body.visibility !== undefined) data.visibility = body.visibility;

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });
    await logAdminAction({
      adminId: session.userId,
      action: 'product.update',
      targetType: 'product',
      targetId: product.id,
      detail: data,
      ip: req.headers.get('x-forwarded-for') ?? undefined,
    });
    return NextResponse.json({ ...product, price: Number(product.price) });
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }
  try {
    // Soft-hide instead of hard delete if orders reference product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { published: false, visibility: 'hidden' },
    });
    await logAdminAction({
      adminId: session.userId,
      action: 'product.hide',
      targetType: 'product',
      targetId: product.id,
      ip: req.headers.get('x-forwarded-for') ?? undefined,
    });
    return NextResponse.json({ ok: true, product: { ...product, price: Number(product.price) } });
  } catch {
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
