import { NextResponse } from 'next/server';
import { signToken, verifyPassword, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEMO_ADMIN = {
  email: 'admin@hermes-shop.local',
  password: 'admin123',
  name: '超级管理员',
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
    }

    try {
      let user = await prisma.user.findUnique({ where: { email } });

      if (
        !user &&
        email === DEMO_ADMIN.email &&
        password === DEMO_ADMIN.password
      ) {
        user = await prisma.user.create({
          data: {
            email: DEMO_ADMIN.email,
            passwordHash: await hashPassword(DEMO_ADMIN.password),
            name: DEMO_ADMIN.name,
            role: 'ADMIN',
            adminRole: 'super_admin',
            ageVerified: true,
          },
        });
      }

      if (user) {
        if (user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: '该账号不是管理员，请使用前台登录' },
            { status: 403 }
          );
        }
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
          return NextResponse.json({ error: '管理员账号或密码错误' }, { status: 401 });
        }
        const token = await signToken({
          userId: user.id,
          email: user.email,
          role: 'ADMIN',
          adminRole: user.adminRole || 'super_admin',
        });
        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: 'ADMIN',
            adminRole: user.adminRole,
            name: user.name,
          },
        });
        // Admin uses same cookie name but role=ADMIN; middleware enforces
        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    } catch {
      // demo fallback
    }

    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const token = await signToken({
        userId: 'admin-demo',
        email: DEMO_ADMIN.email,
        role: 'ADMIN',
        adminRole: 'super_admin',
      });
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'admin-demo',
          email: DEMO_ADMIN.email,
          role: 'ADMIN',
          adminRole: 'super_admin',
          name: DEMO_ADMIN.name,
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

    return NextResponse.json(
      { error: '管理员账号或密码错误（演示：admin@hermes-shop.local / admin123）' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
