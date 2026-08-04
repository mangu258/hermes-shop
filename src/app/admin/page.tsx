import Link from 'next/link';
import { Package, ShoppingBag, Users, Settings, CreditCard, ScrollText } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <span className="rounded bg-gray-900 px-2 py-0.5 text-xs text-white">ADMIN</span>
            Hermes Shop 管理后台
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">返回前台</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold">控制台概览</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50"><Package className="h-5 w-5 text-brand-600" /></div>
            <p className="text-sm text-gray-500">商品（演示）</p>
            <p className="text-2xl font-bold">6</p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><ShoppingBag className="h-5 w-5 text-blue-600" /></div>
            <p className="text-sm text-gray-500">待处理订单</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><Users className="h-5 w-5 text-green-600" /></div>
            <p className="text-sm text-gray-500">用户</p>
            <p className="text-2xl font-bold">—</p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50"><Settings className="h-5 w-5 text-purple-600" /></div>
            <p className="text-sm text-gray-500">支付通道</p>
            <p className="text-2xl font-bold">5</p>
            <p className="mt-1 text-xs text-gray-400">全部默认关闭</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">快捷入口</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/payments" className="flex items-center gap-3 rounded-xl border bg-white p-5 transition hover:border-pink-200 hover:shadow-sm">
              <CreditCard className="h-5 w-5 text-brand-600" />
              <div>
                <div className="font-medium">支付通道管理</div>
                <div className="text-sm text-gray-500">配置 API Key / 启用通道</div>
              </div>
            </Link>
            <Link href="/admin/audit-logs" className="flex items-center gap-3 rounded-xl border bg-white p-5 transition hover:border-pink-200 hover:shadow-sm">
              <ScrollText className="h-5 w-5 text-brand-600" />
              <div>
                <div className="font-medium">审计日志</div>
                <div className="text-sm text-gray-500">查看管理员操作记录</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-medium">部署提示</p>
          <p className="mt-1">
            配置 <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>、<code className="rounded bg-amber-100 px-1">JWT_SECRET</code>、
            <code className="rounded bg-amber-100 px-1">CONFIG_ENCRYPTION_KEY</code> 后执行
            <code className="mx-1 rounded bg-amber-100 px-1">npx prisma db push</code>。
            Stripe Webhook 指向 <code className="rounded bg-amber-100 px-1">/api/payments/webhook/stripe</code>。
          </p>
        </div>
      </main>
    </div>
  );
}
