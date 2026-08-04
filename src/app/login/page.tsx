'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }
      try {
        const raw = localStorage.getItem('hermes-cart');
        if (raw) {
          const parsed = JSON.parse(raw);
          const items = parsed?.state?.items || [];
          if (items.length) {
            await fetch('/api/cart/merge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ localItems: items }),
            });
          }
        }
      } catch {
        /* ignore */
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center">
            <Heart className="mb-2 h-10 w-10 fill-brand-500 text-brand-500" />
            <h1 className="text-2xl font-bold">用户登录</h1>
            <p className="mt-1 text-sm text-gray-500">前台买家入口 · 管理员请走后台</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-brand-400"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-brand-400"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/forgot-password" className="text-brand-600 hover:underline">
              忘记密码
            </Link>
            {' · '}
            <Link href="/register" className="text-brand-600 hover:underline">
              注册
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            演示：user@store.com / user123
            <br />
            <Link href="/admin/login" className="hover:underline">
              管理员登录 →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
