'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<Record<string, string>>({});

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
    const body: Record<string, string> = { orderId, action };
    if (action === 'ship') {
      body.trackingNumber = tracking[orderId] || '';
    }
    if (!confirm(`确认执行：${action}？`)) return;
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
          PENDING → 确认收款 → PAID → 填写单号发货 → SHIPPED → 完成；PENDING 可取消归还库存
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
              </div>
              {o.trackingNumber && (
                <div className="mt-1 text-xs text-gray-600">物流单号：{o.trackingNumber}</div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {o.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => run(o.id, 'confirm_paid')}
                      className="rounded bg-gray-900 px-3 py-1 text-xs text-white"
                    >
                      确认已收款
                    </button>
                    <button
                      onClick={() => run(o.id, 'cancel')}
                      className="rounded border px-3 py-1 text-xs"
                    >
                      取消
                    </button>
                  </>
                )}
                {o.status === 'PAID' && (
                  <div className="flex w-full flex-wrap items-center gap-2">
                    <input
                      className="rounded border px-2 py-1 text-xs"
                      placeholder="物流单号（可选）"
                      value={tracking[o.id] || ''}
                      onChange={(e) =>
                        setTracking((t) => ({ ...t, [o.id]: e.target.value }))
                      }
                    />
                    <button
                      onClick={() => run(o.id, 'ship')}
                      className="rounded bg-gray-900 px-3 py-1 text-xs text-white"
                    >
                      标记已发货
                    </button>
                  </div>
                )}
                {o.status === 'SHIPPED' && (
                  <button
                    onClick={() => run(o.id, 'complete')}
                    className="rounded bg-gray-900 px-3 py-1 text-xs text-white"
                  >
                    标记已完成
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
