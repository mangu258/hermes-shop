'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  async function confirmPaid(orderId: string) {
    if (!confirm('确认已收到该笔款项？')) return;
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, action: 'confirm_paid' }),
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
        {loading && <p className="text-sm text-gray-500">加载中...</p>}
        {!loading && orders.length === 0 && (
          <p className="text-sm text-gray-400">暂无订单（需配置数据库并产生真实订单）</p>
        )}
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border bg-white p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-xs text-gray-500">{o.id}</span>
                <span>{o.status}</span>
              </div>
              <div className="mt-1">
                ¥{Number(o.total).toFixed(2)} · {o.user?.email || '—'}
                {o.paymentChannel ? ` · ${o.paymentChannel}` : ''}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {o.createdAt ? new Date(o.createdAt).toLocaleString('zh-CN') : ''}
              </div>
              {o.status === 'PENDING' && (
                <button
                  onClick={() => confirmPaid(o.id)}
                  className="mt-2 rounded bg-gray-900 px-3 py-1 text-xs text-white"
                >
                  确认已收款
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
