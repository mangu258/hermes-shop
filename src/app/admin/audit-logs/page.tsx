'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="font-bold">操作审计日志</div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">← 返回控制台</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading && <p className="text-sm text-gray-500">加载中...</p>}
        {!loading && logs.length === 0 && (
          <p className="text-sm text-gray-400">暂无审计日志（配置数据库后，敏感操作会自动记录）</p>
        )}
        {logs.length > 0 && (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">操作</th>
                  <th className="p-3 text-left">目标</th>
                  <th className="p-3 text-left">IP</th>
                  <th className="p-3 text-left">时间</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-3 font-mono text-xs">{log.action}</td>
                    <td className="p-3 text-xs text-gray-500">
                      {log.targetType} · {log.targetId?.slice?.(0, 8)}
                    </td>
                    <td className="p-3 text-xs text-gray-400">{log.ip || '—'}</td>
                    <td className="p-3 text-xs text-gray-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('zh-CN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
