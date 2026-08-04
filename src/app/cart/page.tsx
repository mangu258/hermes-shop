'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, totalCount } = useCartStore();

  async function checkout() {
    if (items.length === 0) return;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '下单失败');
      return;
    }
    alert(
      data.source === 'demo'
        ? `演示订单已创建：${data.id}\n金额 ¥${data.total}\n\n${data.message || ''}`
        : `订单已创建：${data.id}\n金额 ¥${data.total}（库存已预扣）`
    );
    clear();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-6 text-2xl font-bold">购物车 {totalCount() > 0 && `(${totalCount()})`}</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <div className="rounded-full bg-pink-50 p-6">
                <ShoppingBag className="h-12 w-12 text-pink-400" />
              </div>
              <p className="mt-6 text-gray-600">购物车是空的</p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
              >
                <ArrowLeft className="h-4 w-4" /> 去选购商品
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between rounded-xl border bg-white p-4">
                    <div>
                      <div className="font-medium">{item.title || item.productId}</div>
                      {item.price != null && (
                        <div className="text-sm text-brand-600">¥{item.price.toFixed(2)}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                        className="w-16 rounded border px-2 py-1 text-sm"
                      />
                      <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={checkout}
                  className="flex-1 rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700"
                >
                  去结算（创建订单并预扣库存）
                </button>
                <button onClick={clear} className="rounded-full border px-6 py-3 text-sm text-gray-600 hover:bg-gray-50">
                  清空
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                登录用户可调用 /api/cart 同步到服务端；游客使用本地存储。配置 DATABASE_URL 后订单将真实预扣库存。
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
