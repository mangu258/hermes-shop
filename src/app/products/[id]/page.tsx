import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import AddToCart from './AddToCart';
import { DEMO_PRODUCTS } from '@/lib/demo-data';
import { ArrowLeft, Package, Shield } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = DEMO_PRODUCTS.find((p) => p.id === params.id);
  if (!product) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <Link
            href="/products"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" /> 返回商品列表
          </Link>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50">
              <img
                src={product.imageUrl!}
                alt={product.title}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-wide text-brand-500">
                {product.category}
              </p>
              <h1 className="mb-4 text-3xl font-bold">{product.title}</h1>
              <p className="mb-6 text-3xl font-bold text-brand-600">
                ¥{product.price.toFixed(2)}
              </p>
              <p className="mb-8 leading-relaxed text-gray-700">{product.description}</p>
              <div className="mb-8 space-y-3 rounded-xl bg-pink-50 p-4 text-sm">
                <div className="flex items-center gap-2 text-pink-800">
                  <Package className="h-4 w-4" /> 无敏感盲盒包装，快递单仅显示「日用品」
                </div>
                <div className="flex items-center gap-2 text-pink-800">
                  <Shield className="h-4 w-4" /> 身体安全材质，附清洁与使用说明
                </div>
              </div>
              <AddToCart
                productId={product.id}
                title={product.title}
                price={product.price}
                imageUrl={product.imageUrl}
              />
              <p className="mt-4 text-xs text-gray-500">
                库存：{product.stock} 件 · 支持未开封7天无理由退换
              </p>
            </div>
          </div>

          <ProductReviews productId={product.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
