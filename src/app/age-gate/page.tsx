'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary, t } from '@/lib/i18n';

export default function AgeGatePage() {
  const router = useRouter();
  const [dict, setDict] = useState(getDictionary('zh'));

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
    setDict(getDictionary(match?.[1] || 'zh'));
  }, []);

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
      <h1 className="mb-4 text-3xl font-bold">{t(dict, 'ageGate.title')}</h1>
      <p className="mb-8 max-w-md text-gray-300">{t(dict, 'ageGate.warning')}</p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => confirm(true)}
          className="rounded-full bg-brand-600 px-8 py-3 font-semibold hover:bg-brand-700"
        >
          {t(dict, 'ageGate.confirm')}
        </button>
        <button
          onClick={() => confirm(false)}
          className="rounded-full border border-gray-600 px-8 py-3 font-semibold text-gray-300 hover:bg-gray-800"
        >
          {t(dict, 'ageGate.deny')}
        </button>
      </div>
    </div>
  );
}
