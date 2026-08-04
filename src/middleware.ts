import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hermes-shop-dev-secret-change-in-production-2026'
);

const AGE_GATE_EXEMPT = [
  '/age-gate',
  '/api',
  '/admin',
  '/_next',
  '/favicon.ico',
  '/terms',
  '/privacy',
  '/refund-policy',
];

function isExempt(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Age gate
  if (!isExempt(pathname, AGE_GATE_EXEMPT)) {
    const ageVerified = req.cookies.get('age_verified')?.value;
    if (!ageVerified) {
      return NextResponse.redirect(new URL('/age-gate', req.url));
    }
  }

  // 2. Admin protection
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return isAdminApi
        ? NextResponse.json({ error: '未授权' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin/login', req.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'ADMIN') {
        return isAdminApi
          ? NextResponse.json({ error: '无权限' }, { status: 403 })
          : NextResponse.redirect(new URL('/admin/login', req.url));
      }
    } catch {
      return isAdminApi
        ? NextResponse.json({ error: '未授权' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'],
};
