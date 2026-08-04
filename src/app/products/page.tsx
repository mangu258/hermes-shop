import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="mb-2 text-3xl font-bold">全部商品</h1>
          <p className="mb-8 text-gray-600">隐私包装 · 安全材质 · 专业选型</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DEMO_PRODUCTS.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-pink-200 hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                  <img src={p.imageUrl!} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
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
      </main>
      <Footer />
    </>
  );
}
