'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ACTIONS: Record<string, { action: string; label: string }[]> = {
  PENDING: [
    { action: 'confirm_paid', label: '确认已收款' },
    { action: 'cancel', label: '取消并归还库存' },
  ],
  PAID: [{ action: 'ship', label: '标记已发货' }],
  SHIPPED: [{ action: 'complete', label: '标记已完成' }],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function run(orderId: string, action: string) {
    if (!confirm(`确认执行：${action}？`)) return;
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, action }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '失败');
      return;
    }
    load();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="font-bold">订单管理</div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
            ← 返回控制台
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="mb-4 text-xs text-gray-500">
          状态流：PENDING → 确认收款 → PAID → 发货 → SHIPPED → 完成 → COMPLETED；PENDING 可取消归还库存
        </p>
        {loading && <p className="text-sm text-gray-500">加载中...</p>}
        {!loading && orders.length === 0 && (
          <p className="text-sm text-gray-400">暂无订单</p>
        )}
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border bg-white p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-xs text-gray-500">{o.id}</span>
                <span className="font-medium">{o.status}</span>
              </div>
              <div className="mt-1">
                ¥{Number(o.total).toFixed(2)} · {o.user?.email || '—'}
                {o.paymentChannel ? ` · ${o.paymentChannel}` : ''}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {o.createdAt ? new Date(o.createdAt).toLocaleString('zh-CN') : ''}
              </div>
              {o.items?.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600">
                  {o.items.map((it: any, i: number) => (
                    <li key={i}>
                      {it.product?.title || it.productId} × {it.quantity}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {(ACTIONS[o.status] || []).map((a) => (
                  <button
                    key={a.action}
                    onClick={() => run(o.id, a.action)}
                    className="rounded bg-gray-900 px-3 py-1 text-xs text-white"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
