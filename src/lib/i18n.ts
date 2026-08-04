import zh from '../../messages/zh.json';
import en from '../../messages/en.json';

const dictionaries: Record<string, typeof zh> = { zh, en };

export type Locale = 'zh' | 'en';

export function getDictionary(locale: string = 'zh') {
  return dictionaries[locale] ?? dictionaries.zh;
}

export function t(
  dict: typeof zh,
  path: string,
  fallback?: string
): string {
  const parts = path.split('.');
  let cur: any = dict;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return fallback ?? path;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : fallback ?? path;
}
