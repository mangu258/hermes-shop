'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || '失败');
      return;
    }
    alert('密码已重置，请登录');
    router.push('/login');
  }

  if (!token) {
    return <p className="text-sm text-red-500">缺少 token，请从邮件或忘记密码页重新获取。</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="新密码（至少6位）"
        className="w-full rounded-xl border px-4 py-2.5 text-sm"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? '提交中...' : '重置密码'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-xl font-bold">设置新密码</h1>
          <Suspense fallback={<p className="text-sm text-gray-500">加载中...</p>}>
            <ResetForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="text-brand-600 hover:underline">
              返回登录
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
