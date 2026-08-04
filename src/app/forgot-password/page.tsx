'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [devLink, setDevLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    setDevLink('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '失败');
        return;
      }
      setMsg(data.message || '已提交');
      if (data.devResetPath) setDevLink(data.devResetPath);
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
          <h1 className="mb-2 text-xl font-bold">忘记密码</h1>
          <p className="mb-6 text-sm text-gray-500">输入注册邮箱，获取重置链接（30分钟有效）</p>
          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className="w-full rounded-xl border px-4 py-2.5 text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {msg && <p className="text-sm text-green-600">{msg}</p>}
            {devLink && (
              <p className="text-xs text-amber-700">
                开发模式链接：{' '}
                <Link href={devLink} className="underline">
                  {devLink}
                </Link>
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? '提交中...' : '发送重置链接'}
            </button>
          </form>
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
