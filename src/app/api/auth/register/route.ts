import { NextResponse } from 'next/server';
import { hashPassword, signToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || String(password).length < 6) {
      return NextResponse.json(
        { error: '请填写邮箱，密码至少6位' },
        { status: 400 }
      );
    }

    try {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 });
      }

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await hashPassword(password),
          name: name || null,
          role: 'USER',
        },
      });

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: 'USER',
      });

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, role: 'USER', name: user.name },
      });
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } catch {
      return NextResponse.json(
        { error: '注册需要数据库。请配置 DATABASE_URL 后执行 npx prisma db push' },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
