import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return NextResponse.json(
        { error: '请填写当前密码，新密码至少6位' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在于数据库（演示模式无法改密）' },
        { status: 400 }
      );
    }

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '修改失败' }, { status: 500 });
  }
}
