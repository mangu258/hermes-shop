import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="rounded-full bg-pink-50 p-6">
          <ShoppingBag className="h-12 w-12 text-pink-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">购物车为空</h1>
        <p className="mt-2 max-w-md text-center text-gray-600">
          演示版本购物车功能已预留。连接数据库并完善下单流程后即可使用。
        </p>
        <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
          <ArrowLeft className="h-4 w-4" /> 去选购商品
        </Link>
      </main>
      <Footer />
    </>
  );
}
