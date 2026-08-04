'use client';

import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

export default function AddToCart({
  productId,
  title,
  price,
  imageUrl,
}: {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ productId, quantity: 1, title, price, imageUrl });
        alert('已加入购物车');
      }}
      className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-brand-700"
    >
      <ShoppingBag className="h-5 w-5" /> 加入购物车
    </button>
  );
}
