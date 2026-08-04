'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@hermes-shop.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 rounded-full bg-gray-900 p-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">管理后台登录</h1>
          <p className="mt-1 text-sm text-gray-500">演示：admin@hermes-shop.local / admin123</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-gray-400" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-gray-400" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
            {loading ? '验证中...' : '进入后台'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">
          <a href="/" className="hover:underline">返回商城前台</a>
        </p>
      </div>
    </div>
  );
}
