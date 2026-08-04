import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Demo super admin (replace with DB in production)
    if (email === 'admin@hermes-shop.local' && password === 'admin123') {
      const token = await signToken({
        userId: 'admin-001',
        email: 'admin@hermes-shop.local',
        role: 'ADMIN',
        adminRole: 'super_admin',
      });

      const response = NextResponse.json({
        success: true,
        user: { id: 'admin-001', email, role: 'ADMIN', adminRole: 'super_admin', name: '超级管理员' },
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

    return NextResponse.json({ error: '管理员账号或密码错误（演示：admin@hermes-shop.local / admin123）' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
