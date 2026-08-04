import { NextResponse } from 'next/server';
import { signToken, verifyPassword, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEMO_USER = {
  email: 'user@store.com',
  password: 'user123',
  name: '演示用户',
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
    }

    // 1) Try database user (role must be USER for storefront login)
    try {
      let user = await prisma.user.findUnique({ where: { email } });

      // Auto-provision demo user into DB so order FK works
      if (
        !user &&
        email === DEMO_USER.email &&
        password === DEMO_USER.password
      ) {
        user = await prisma.user.create({
          data: {
            email: DEMO_USER.email,
            passwordHash: await hashPassword(DEMO_USER.password),
            name: DEMO_USER.name,
            role: 'USER',
            ageVerified: true,
          },
        });
      }

      if (user) {
        if (user.role === 'ADMIN') {
          return NextResponse.json(
            { error: '管理员请使用后台登录入口 /admin/login' },
            { status: 403 }
          );
        }
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
          return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
        }
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
        // Clear any admin-only cookie if present
        response.cookies.set('admin_token', '', { httpOnly: true, path: '/', maxAge: 0 });
        return response;
      }
    } catch {
      // DB unavailable → demo fallback below
    }

    // 2) Demo fallback (no DB)
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const token = await signToken({
        userId: 'user-demo',
        email: DEMO_USER.email,
        role: 'USER',
      });
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'user-demo',
          email: DEMO_USER.email,
          role: 'USER',
          name: DEMO_USER.name,
        },
        mode: 'demo',
      });
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
