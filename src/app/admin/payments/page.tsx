'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AVAILABLE_PROVIDERS, type ProviderDef } from '@/lib/payment/provider-registry';

interface Channel {
  id: string;
  key: string;
  displayName: string;
  type: string;
  enabled: boolean;
  configComplete: boolean;
  qrCodeImage?: string | null;
  config?: Record<string, any>;
}

export default function AdminPaymentsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/payments/channels')
      .then((r) => r.json())
      .then((data) => {
        setChannels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function openConfig(key: string) {
    setEditingKey(key);
    setFormValues({});
    setMsg('');
  }

  async function saveConfig(channel: Channel, def: ProviderDef) {
    setMsg('保存中...');
    const res = await fetch(`/api/admin/payments/channels/${channel.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: formValues }),
    });
    const updated = await res.json();
    if (!res.ok) {
      setMsg(updated.error || '保存失败');
      return;
    }
    setChannels((cs) => cs.map((c) => (c.id === channel.id ? { ...c, ...updated } : c)));
    setEditingKey(null);
    setMsg('配置已保存');
  }

  async function toggleEnabled(channel: Channel) {
    if (!channel.configComplete) {
      alert('请先完成该通道的配置（API Key 等）后再启用');
      return;
    }
    const res = await fetch(`/api/admin/payments/channels/${channel.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !channel.enabled }),
    });
    const updated = await res.json();
    if (res.ok) {
      setChannels((cs) => cs.map((c) => (c.id === channel.id ? { ...c, ...updated } : c)));
    }
  }

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="font-bold">支付通道管理</div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">← 返回控制台</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-4 text-sm text-gray-500">
          所有通道默认关闭。需先完成配置（API Key / 收款信息）后才能启用。敏感字段加密存储。
        </p>
        {msg && <p className="mb-3 text-sm text-green-600">{msg}</p>}

        <div className="space-y-4">
          {channels.map((channel) => {
            const def = AVAILABLE_PROVIDERS.find((p) => p.key === channel.key);
            if (!def) return null;
            return (
              <div key={channel.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{channel.displayName}</div>
                    <div className="mt-1 text-xs">
                      {channel.configComplete ? (
                        <span className="text-green-600">✓ 配置已完成</span>
                      ) : (
                        <span className="text-amber-500">⚠ 未配置</span>
                      )}
                      <span className="ml-2 text-gray-400">type: {channel.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(def.type === 'api' || def.type === 'manual') && (
                      <button
                        onClick={() => openConfig(channel.key)}
                        className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                      >
                        配置
                      </button>
                    )}
                    <button
                      onClick={() => toggleEnabled(channel)}
                      disabled={!channel.configComplete}
                      className={`rounded px-3 py-1 text-sm ${
                        channel.enabled
                          ? 'bg-green-100 text-green-700'
                          : channel.configComplete
                          ? 'bg-gray-100 text-gray-600'
                          : 'cursor-not-allowed bg-gray-50 text-gray-300'
                      }`}
                    >
                      {channel.enabled ? '已启用' : '已禁用'}
                    </button>
                  </div>
                </div>

                {editingKey === channel.key && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    {def.fields.map((field) => (
                      <div key={field.key}>
                        <label className="text-sm text-gray-600">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            className="mt-1 w-full rounded border p-2 text-sm"
                            rows={3}
                            onChange={(e) =>
                              setFormValues((v) => ({ ...v, [field.key]: e.target.value }))
                            }
                          />
                        ) : (
                          <input
                            type={field.type}
                            className="mt-1 w-full rounded border p-2 text-sm"
                            placeholder={field.type === 'password' ? '留空表示不修改' : ''}
                            onChange={(e) =>
                              setFormValues((v) => ({ ...v, [field.key]: e.target.value }))
                            }
                          />
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveConfig(channel, def)}
                        className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white"
                      >
                        保存配置
                      </button>
                      <button onClick={() => setEditingKey(null)} className="text-sm text-gray-500">
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
