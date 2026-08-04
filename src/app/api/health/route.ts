import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, string> = {
    app: 'ok',
    time: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'unavailable';
  }

  checks.stripe = process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing';
  checks.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    ? 'configured'
    : 'missing';
  checks.jwt = process.env.JWT_SECRET ? 'configured' : 'default-dev';
  checks.cronSecret = process.env.CRON_SECRET ? 'configured' : 'missing';

  const healthy = checks.database === 'ok';
  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks },
    { status: healthy ? 200 : 503 }
  );
}
