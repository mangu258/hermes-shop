'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push('/login');
          return;
        }
        setUser(d.user);
      });
  }, [router]);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setError('');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '失败');
      return;
    }
    setMsg('密码已更新');
    setCurrent('');
    setNew('');
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8 text-sm text-gray-500">
          加载中...
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-md px-4">
          <h1 className="mb-2 text-2xl font-bold">我的账户</h1>
          <p className="mb-6 text-sm text-gray-600">
            {user.email} · {user.role === 'ADMIN' ? '管理员' : '用户'}
          </p>

          <form onSubmit={changePassword} className="mb-8 space-y-3 rounded-xl border bg-white p-5">
            <h2 className="font-medium">修改密码</h2>
            <input
              type="password"
              placeholder="当前密码"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              placeholder="新密码（至少6位）"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              minLength={6}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {msg && <p className="text-sm text-green-600">{msg}</p>}
            <button type="submit" className="rounded-full bg-brand-600 px-5 py-2 text-sm text-white">
              更新密码
            </button>
          </form>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/orders" className="text-brand-600 hover:underline">
              我的订单
            </Link>
            <button onClick={logout} className="text-gray-500 hover:underline">
              退出登录
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
