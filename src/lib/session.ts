import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { verifyToken, type TokenPayload } from './auth';

export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  const token = req
    ? req.cookies.get('token')?.value
    : cookies().get('token')?.value;

  if (!token) return null;
  return verifyToken(token);
}
