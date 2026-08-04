'use client';

import { useEffect, useState } from 'react';

const LOCALES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
] as const;

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState('zh');

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
    if (match?.[1]) setLocale(match[1]);
  }, []);

  function switchTo(code: string) {
    document.cookie = `locale=${code}; path=/; max-age=31536000; samesite=lax`;
    setLocale(code);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => switchTo(l.code)}
          className={`rounded px-1.5 py-0.5 ${
            locale === l.code
              ? 'bg-pink-100 font-medium text-brand-700'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
