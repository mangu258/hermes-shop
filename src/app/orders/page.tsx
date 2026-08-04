'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface OrderRow {
  id: string;
  status: string;
  total: number | string;
  paymentChannel?: string | null;
  trackingNumber?: string | null;
  createdAt?: string;
  items?: { quantity: number; product?: { title?: string } }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === '1')
      setMsg('支付已提交，以到账结果为准（Webhook 确认后状态会更新）。');
    if (params.get('cancelled') === '1')
      setMsg('已取消支付，订单仍为待支付。');

    fetch('/api/orders')
      .then(async (r) => {
        const data = await r.json();
        if (r.status === 401) {
          setMsg('请先登录后查看订单');
          setOrders([]);
          return;
        }
        setOrders(data.orders || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  async function payStripe(orderId: string) {
    const res = await fetch('/api/payments/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '无法创建支付');
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function cancelOrder(orderId: string) {
    if (!confirm('确认取消该订单？库存将归还。')) return;
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '取消失败');
      return;
    }
    setOrders((list) =>
      list.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
    );
  }

  const statusLabel: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-2 text-2xl font-bold">我的订单</h1>
          {msg && <p className="mb-4 text-sm text-brand-600">{msg}</p>}
          {loading && <p className="text-sm text-gray-500">加载中...</p>}
          {!loading && orders.length === 0 && (
            <p className="text-gray-500">
              暂无订单。{' '}
              <Link href="/products" className="text-brand-600 hover:underline">
                去选购
              </Link>
            </p>
          )}
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-gray-500">
                    {o.id.slice(0, 8)}… ·{' '}
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString('zh-CN')
                      : ''}
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {statusLabel[o.status] || o.status}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold text-brand-600">
                  ¥{Number(o.total).toFixed(2)}
                </p>
                {o.trackingNumber && (
                  <p className="mt-1 text-sm text-gray-600">
                    物流单号：{o.trackingNumber}
                  </p>
                )}
                {o.status === 'PENDING' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => payStripe(o.id)}
                      className="rounded-full bg-brand-600 px-4 py-1.5 text-sm text-white"
                    >
                      Stripe 支付
                    </button>
                    <button
                      onClick={() => cancelOrder(o.id)}
                      className="rounded-full border px-4 py-1.5 text-sm text-gray-600"
                    >
                      取消订单
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
