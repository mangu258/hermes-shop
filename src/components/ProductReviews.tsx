'use client';

import { useState, useEffect } from 'react';

export default function ProductReviews({ productId }: { productId: string }) {
  const [data, setData] = useState<{
    reviews: any[];
    avgRating: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ reviews: [], avgRating: 0, total: 0 }));
  }, [productId]);

  if (!data) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-medium">用户评价</h2>
        {data.total > 0 && (
          <span className="text-sm text-gray-500">
            {'★'.repeat(Math.round(data.avgRating))}
            {'☆'.repeat(5 - Math.round(data.avgRating))} {data.avgRating}（{data.total}条）
          </span>
        )}
      </div>
      {data.reviews.length === 0 && (
        <p className="text-sm text-gray-400">暂无评价</p>
      )}
      <div className="space-y-3">
        {data.reviews.map((r) => (
          <div key={r.id} className="border-b pb-3">
            <div className="flex items-center gap-2 text-sm">
              <span>
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </span>
              <span className="text-gray-400">{r.user?.email}</span>
              <span className="text-xs text-gray-300">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('zh-CN') : ''}
              </span>
            </div>
            {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
