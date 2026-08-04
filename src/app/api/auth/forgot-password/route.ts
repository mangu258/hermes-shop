import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Creates a reset token. Without email provider, returns resetPath in non-production
 * so you can open it locally. Production always returns generic success (no email leak).
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: '请填写邮箱' }, { status: 400 });
    }

    const generic = {
      ok: true,
      message: '若该邮箱已注册，请查收重置说明（或联系管理员）。',
    };

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(generic);
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const base =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetPath = `/reset-password?token=${token}`;
      const resetUrl = `${base}${resetPath}`;

      // Hook for real email later (Resend etc.)
      if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM,
              to: email,
              subject: '重置密码 · Hermes Shop',
              html: `<p>点击链接重置密码（30分钟内有效）：</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
            }),
          });
        } catch (e) {
          console.error('email send failed', e);
        }
      } else {
        console.log('[forgot-password] reset link:', resetUrl);
      }

      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          ...generic,
          devResetPath: resetPath,
        });
      }
      return NextResponse.json(generic);
    } catch {
      return NextResponse.json({
        ok: false,
        error: '需要数据库。请配置 DATABASE_URL 后重试。',
      }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ error: '请求失败' }, { status: 500 });
  }
}
