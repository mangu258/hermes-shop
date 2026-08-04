'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  published: boolean;
  visibility: string;
}

const emptyForm = {
  title: '',
  description: '',
  price: '',
  stock: '0',
  imageUrl: '',
  published: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    fetch('/api/admin/products')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || '加载失败');
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      imageUrl: p.imageUrl || '',
      published: p.published,
    });
    setMsg('');
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('保存中...');
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl || null,
      published: form.published,
    };
    const url = editingId
      ? `/api/admin/products/${editingId}`
      : '/api/admin/products';
    const res = await fetch(url, {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '保存失败');
      setMsg('');
      return;
    }
    setMsg(editingId ? '已更新' : '已创建');
    resetForm();
    load();
  }

  async function hideProduct(id: string) {
    if (!confirm('下架该商品？（不物理删除，避免订单关联问题）')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '失败');
      return;
    }
    load();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="font-bold">商品管理</div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
            ← 返回控制台
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <form onSubmit={save} className="rounded-xl border bg-white p-5 space-y-3">
          <h2 className="font-semibold">{editingId ? '编辑商品' : '新建商品'}</h2>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="描述"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="flex flex-wrap gap-3">
            <input
              className="w-32 rounded border px-3 py-2 text-sm"
              placeholder="价格"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <input
              className="w-32 rounded border px-3 py-2 text-sm"
              placeholder="库存"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              上架
            </label>
          </div>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="图片 URL（可选）"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-sm text-white">
              {editingId ? '保存修改' : '创建'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-gray-500">
                取消编辑
              </button>
            )}
          </div>
        </form>

        {loading && <p className="text-sm text-gray-500">加载中...</p>}
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-4 text-sm"
            >
              <div>
                <div className="font-medium">
                  {p.title}{' '}
                  {!p.published && (
                    <span className="text-xs text-amber-600">已下架</span>
                  )}
                </div>
                <div className="text-gray-500">
                  ¥{Number(p.price).toFixed(2)} · 库存 {p.stock}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(p)}
                  className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                >
                  编辑
                </button>
                <button
                  onClick={() => hideProduct(p.id)}
                  className="rounded border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  下架
                </button>
              </div>
            </div>
          ))}
          {!loading && products.length === 0 && (
            <p className="text-sm text-gray-400">暂无商品。请先 npm run db:seed 或在上方创建。</p>
          )}
        </div>
      </main>
    </div>
  );
}
