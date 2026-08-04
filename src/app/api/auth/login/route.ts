import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (email === 'user@store.com' && password === 'user123') {
      const token = await signToken({
        userId: 'user-001',
        email: 'user@store.com',
        role: 'USER',
      });

      const response = NextResponse.json({
        success: true,
        user: { id: 'user-001', email, role: 'USER', name: '演示用户' },
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
