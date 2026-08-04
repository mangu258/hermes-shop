import Link from 'next/link';
import { Heart, Package, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2 font-bold text-brand-600">
              <Heart className="h-5 w-5 fill-brand-500" /> Hermes Shop
            </div>
            <p className="text-sm text-gray-600">隐私优先的成人健康商城，无敏感盲盒发货。</p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">核心承诺</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Package className="h-4 w-4 text-brand-500" /> 无敏感盲盒包装</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-500" /> 医用级安全材质</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">法律信息</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/terms" className="hover:text-brand-600">服务条款</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-600">隐私政策</Link></li>
              <li><Link href="/refund-policy" className="hover:text-brand-600">退款政策</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-500">
          © 2026 Hermes Shop · 仅限18岁以上成人 · 隐私保护至上
        </div>
      </div>
    </footer>
  );
}
