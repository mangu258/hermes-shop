'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, totalCount } = useCartStore();

  async function checkout(payWithStripe: boolean) {
    if (items.length === 0) return;

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentChannel: payWithStripe ? 'stripe' : 'manual',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '下单失败（演示账号请先登录：user@store.com / user123）');
      return;
    }

    clear();

    if (data.source === 'demo') {
      alert(
        `演示订单：${data.id}\n金额 ¥${data.total}\n\n${data.message || ''}\n\n配置 DATABASE_URL 后可真实预扣库存并支付。`
      );
      return;
    }

    if (payWithStripe) {
      const payRes = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.id }),
      });
      const payData = await payRes.json();
      if (payRes.ok && payData.url) {
        window.location.href = payData.url;
        return;
      }
      alert(
        (payData.error || '无法调起 Stripe') +
          '\n订单已创建为待支付，可在「我的订单」中重试或等待人工确认。'
      );
    } else {
      alert(`订单已创建：${data.id}\n金额 ¥${data.total}\n状态：待支付（人工/转账确认）`);
    }

    window.location.href = '/orders';
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-6 text-2xl font-bold">
            购物车 {totalCount() > 0 && `(${totalCount()})`}
          </h1>

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
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-xl border bg-white p-4"
                  >
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
                        onChange={(e) =>
                          updateQuantity(item.productId, Number(e.target.value))
                        }
                        className="w-16 rounded border px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => checkout(true)}
                  className="flex-1 rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700"
                >
                  下单并 Stripe 支付
                </button>
                <button
                  onClick={() => checkout(false)}
                  className="flex-1 rounded-full border border-brand-200 py-3 font-semibold text-brand-700 hover:bg-pink-50"
                >
                  下单（待人工确认收款）
                </button>
              </div>
              <button
                onClick={clear}
                className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-800"
              >
                清空购物车
              </button>
              <p className="mt-3 text-xs text-gray-400">
                需登录后创建真实订单。演示用户：user@store.com / user123。Stripe
                需配置密钥；否则订单会保留为待支付。
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
