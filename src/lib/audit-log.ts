import { prisma } from '@/lib/prisma';

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  detail?: Record<string, any>;
  ip?: string;
}) {
  try {
    await prisma.adminAuditLog.create({ data: params });
  } catch (err) {
    console.error('审计日志写入失败:', err);
  }
}
