import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { Package, Shield, Sparkles } from 'lucide-react';

export default function HomePage() {
  const featured = DEMO_PRODUCTS.slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-pink-50 via-rose-50 to-white py-20 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700">
              <Shield className="h-4 w-4" /> 隐私保护 · 盲盒发货 · 专业选型
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              私密健康，从这里开始
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              成人情趣与健康用品专卖。所有商品采用无敏感标志防透包装，快递单仅显示「日用品」。
            </p>
            <Link
              href="/products"
              className="inline-block rounded-full bg-brand-600 px-8 py-3 font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-brand-700"
            >
              浏览全部商品
            </Link>
          </div>
        </section>

        <section className="border-b border-gray-100 bg-white py-12">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-2xl bg-pink-50 p-4"><Package className="h-8 w-8 text-brand-600" /></div>
              <h3 className="mb-2 font-semibold">无敏感盲盒包装</h3>
              <p className="text-sm text-gray-600">硬质防透纸箱，快递单无任何敏感字样</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-2xl bg-pink-50 p-4"><Shield className="h-8 w-8 text-brand-600" /></div>
              <h3 className="mb-2 font-semibold">医用级安全材质</h3>
              <p className="text-sm text-gray-600">硅胶/玻璃等身体安全材质，严格质检</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-2xl bg-pink-50 p-4"><Sparkles className="h-8 w-8 text-brand-600" /></div>
              <h3 className="mb-2 font-semibold">隐私优先</h3>
              <p className="text-sm text-gray-600">订单信息严格保密，不出售给第三方</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">精选推荐</h2>
                <p className="mt-1 text-gray-600">入门友好 · 高评价好物</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline">查看全部 →</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-pink-200 hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                    <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-500">{p.category}</p>
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold group-hover:text-brand-600">{p.title}</h3>
                    <span className="text-lg font-bold text-brand-600">¥{p.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
