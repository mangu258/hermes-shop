import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword || String(newPassword).length < 6) {
      return NextResponse.json(
        { error: '无效请求，新密码至少6位' },
        { status: 400 }
      );
    }

    const row = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return NextResponse.json(
        { error: '链接无效或已过期，请重新申请' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash: await hashPassword(newPassword) },
      }),
      prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '重置失败' }, { status: 500 });
  }
}
