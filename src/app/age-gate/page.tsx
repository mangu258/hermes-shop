'use client';

import { useRouter } from 'next/navigation';

export default function AgeGatePage() {
  const router = useRouter();

  function confirm(isAdult: boolean) {
    if (!isAdult) {
      window.location.href = 'https://www.google.com';
      return;
    }
    document.cookie = 'age_verified=1; path=/; max-age=31536000; samesite=lax';
    router.push('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-center text-white">
      <h1 className="mb-4 text-3xl font-bold">年龄确认</h1>
      <p className="mb-8 max-w-md text-gray-300">
        本网站包含成人内容，仅限18周岁及以上访问。进入即表示您确认已年满18岁。
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => confirm(true)}
          className="rounded-full bg-brand-600 px-8 py-3 font-semibold hover:bg-brand-700"
        >
          我已满18岁，进入
        </button>
        <button
          onClick={() => confirm(false)}
          className="rounded-full border border-gray-600 px-8 py-3 font-semibold text-gray-300 hover:bg-gray-800"
        >
          未满18岁，离开
        </button>
      </div>
    </div>
  );
}
