import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Package, Shield, Lock, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-6 text-3xl font-bold">隐私承诺与发货说明</h1>
          <p className="mb-10 text-lg text-gray-600">我们把「隐私」当作最高优先级。</p>
          <div className="space-y-8">
            <section className="rounded-2xl border border-pink-100 bg-pink-50/50 p-6">
              <div className="mb-3 flex items-center gap-3"><Package className="h-6 w-6 text-brand-600" /><h2 className="text-xl font-semibold">无敏感盲盒包装</h2></div>
              <p className="text-gray-700">所有商品使用无任何品牌、产品名称的硬质纸箱。快递单仅打印「日用品」或「个人护理用品」。</p>
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <div className="mb-3 flex items-center gap-3"><Truck className="h-6 w-6 text-brand-600" /><h2 className="text-xl font-semibold">发货与物流</h2></div>
              <p className="text-gray-700">日常订单1-2个工作日内发出，支持主流快递。</p>
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <div className="mb-3 flex items-center gap-3"><Lock className="h-6 w-6 text-brand-600" /><h2 className="text-xl font-semibold">数据与隐私</h2></div>
              <p className="text-gray-700">订单与账户信息仅用于履约与客服，不出售、不共享给第三方营销。</p>
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <div className="mb-3 flex items-center gap-3"><Shield className="h-6 w-6 text-brand-600" /><h2 className="text-xl font-semibold">产品安全</h2></div>
              <p className="text-gray-700">优先上架医用级硅胶、硼硅玻璃等身体安全材质产品。支持未开封7天无理由退换。</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
