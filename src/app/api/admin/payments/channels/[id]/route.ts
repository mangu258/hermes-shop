import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { encryptConfig, decryptConfig, maskConfig } from '@/lib/crypto/config-encryption';
import { isConfigComplete, getProviderDef } from '@/lib/payment/provider-registry';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const channel = await prisma.paymentChannel.findUnique({ where: { id: params.id } });
    if (!channel) {
      return NextResponse.json({ error: '通道不存在' }, { status: 404 });
    }

    const def = getProviderDef(channel.key);
    const existingConfig = decryptConfig(channel.config) ?? {};
    const incoming = body.config ?? {};
    // Skip masked placeholders so we don't overwrite real secrets with "••••••••"
    const cleanedIncoming: Record<string, any> = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (v !== '••••••••' && v !== '') cleanedIncoming[k] = v;
    }
    const mergedConfig = { ...existingConfig, ...cleanedIncoming };

    const configComplete =
      def?.type === 'qrcode'
        ? !!(body.qrCodeImage ?? channel.qrCodeImage)
        : isConfigComplete(channel.key, mergedConfig);

    const requestedEnable = body.enabled ?? channel.enabled;
    const finalEnabled = configComplete ? requestedEnable : false;

    const updated = await prisma.paymentChannel.update({
      where: { id: params.id },
      data: {
        config: Object.keys(mergedConfig).length ? encryptConfig(mergedConfig) : null,
        qrCodeImage: body.qrCodeImage ?? channel.qrCodeImage,
        configComplete,
        enabled: finalEnabled,
      },
    });

    const sensitive =
      def?.fields.filter((f) => f.type === 'password').map((f) => f.key) ?? [];

    return NextResponse.json({
      ...updated,
      config: maskConfig(decryptConfig(updated.config), sensitive),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
