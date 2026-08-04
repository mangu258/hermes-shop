'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, ShoppingBag, User, Shield } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname === '/age-gate') return null;

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-600">
          <Heart className="h-6 w-6 fill-brand-500 text-brand-500" />
          <span>Hermes Shop</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="text-gray-700 hover:text-brand-600">首页</Link>
          <Link href="/products" className="text-gray-700 hover:text-brand-600">全部商品</Link>
          <Link href="/about" className="text-gray-700 hover:text-brand-600">隐私承诺</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/cart" className="rounded-full p-2 text-gray-600 hover:bg-pink-50 hover:text-brand-600">
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <Link href="/login" className="rounded-full p-2 text-gray-600 hover:bg-pink-50 hover:text-brand-600">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/admin/login" className="rounded-full p-2 text-gray-400 hover:bg-gray-100" title="管理后台">
            <Shield className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
