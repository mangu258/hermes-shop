import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  CreditCard,
  ScrollText,
  ClipboardList,
  Boxes,
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <span className="rounded bg-gray-900 px-2 py-0.5 text-xs text-white">ADMIN</span>
            Hermes Shop 管理后台
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
            返回前台
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold">控制台</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl border bg-white p-5 hover:border-pink-200 hover:shadow-sm"
          >
            <Boxes className="h-5 w-5 text-brand-600" />
            <div>
              <div className="font-medium">商品管理</div>
              <div className="text-sm text-gray-500">新建 / 编辑 / 下架</div>
            </div>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-xl border bg-white p-5 hover:border-pink-200 hover:shadow-sm"
          >
            <ClipboardList className="h-5 w-5 text-brand-600" />
            <div>
              <div className="font-medium">订单管理</div>
              <div className="text-sm text-gray-500">收款 / 发货 / 完成</div>
            </div>
          </Link>
          <Link
            href="/admin/payments"
            className="flex items-center gap-3 rounded-xl border bg-white p-5 hover:border-pink-200 hover:shadow-sm"
          >
            <CreditCard className="h-5 w-5 text-brand-600" />
            <div>
              <div className="font-medium">支付通道</div>
              <div className="text-sm text-gray-500">配置 Key / 启用</div>
            </div>
          </Link>
          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-3 rounded-xl border bg-white p-5 hover:border-pink-200 hover:shadow-sm"
          >
            <ScrollText className="h-5 w-5 text-brand-600" />
            <div>
              <div className="font-medium">审计日志</div>
              <div className="text-sm text-gray-500">操作记录</div>
            </div>
          </Link>
          <div className="flex items-center gap-3 rounded-xl border bg-white p-5 opacity-80">
            <Package className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-600">健康检查</div>
              <div className="text-sm text-gray-500">GET /api/health</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-white p-5 opacity-80">
            <ShoppingBag className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-600">前台订单</div>
              <div className="text-sm text-gray-500">/orders</div>
            </div>
          </div>
        </div>
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-medium">上线前</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>修改 seed 默认密码（账户页或直接改库）</li>
            <li>配置 JWT_SECRET / STRIPE_* / CRON_SECRET / DATABASE_URL</li>
            <li>Stripe CLI 或 Dashboard 验证 Webhook 验签</li>
            <li>GET /api/health 应返回 healthy</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
