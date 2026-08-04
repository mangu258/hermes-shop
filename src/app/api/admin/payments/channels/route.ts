import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { AVAILABLE_PROVIDERS } from '@/lib/payment/provider-registry';
import { encryptConfig, decryptConfig, maskConfig } from '@/lib/crypto/config-encryption';
import { isConfigComplete, getProviderDef } from '@/lib/payment/provider-registry';

async function requireAdmin(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    let channels = await prisma.paymentChannel.findMany({ orderBy: { sortOrder: 'asc' } });

    // Seed missing providers from registry
    if (channels.length === 0) {
      for (const p of AVAILABLE_PROVIDERS) {
        await prisma.paymentChannel.upsert({
          where: { key: p.key },
          update: {},
          create: {
            key: p.key,
            displayName: p.displayName,
            type: p.type,
            enabled: false,
            configComplete: false,
          },
        });
      }
      channels = await prisma.paymentChannel.findMany({ orderBy: { sortOrder: 'asc' } });
    }

    const safe = channels.map((c) => {
      const def = getProviderDef(c.key);
      const sensitive = def?.fields.filter((f) => f.type === 'password').map((f) => f.key) ?? [];
      return {
        ...c,
        config: maskConfig(decryptConfig(c.config), sensitive),
      };
    });

    return NextResponse.json(safe);
  } catch {
    // Demo mode without DB
    return NextResponse.json(
      AVAILABLE_PROVIDERS.map((p, i) => ({
        id: `demo-${p.key}`,
        key: p.key,
        displayName: p.displayName,
        type: p.type,
        enabled: false,
        configComplete: false,
        qrCodeImage: null,
        config: {},
        sortOrder: i,
      }))
    );
  }
}
