export const SITE_NAME = 'DeepSeek Harness 中文手册';
export const GITHUB_URL = 'https://github.com/xiaomijituan/dsh-handbook';
export const OFFICIAL_DOCS = 'https://deepseek-harness.github.io/deepseek-harness/';
export const OFFICIAL_REPO = 'https://github.com/deepseek-ai/deepseek-harness';

export const BASE = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return path;
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  if (path === '/') return `${base}/`;
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

export function formatCheckedDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function absoluteBase(site?: URL): string {
  const origin = (site ?? new URL('http://localhost:4321')).href.replace(/\/$/, '');
  return `${origin}${BASE.endsWith('/') ? BASE.slice(0, -1) : BASE}`;
}
