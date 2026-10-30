import type { APIRoute } from 'astro';
import { absoluteBase, withBase } from '../consts';

export const GET: APIRoute = ({ site }) => {
  const base = absoluteBase(site);
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${withBase('/search/')}`,
    '',
    `Sitemap: ${base}/sitemap-index.xml`,
    `Sitemap: ${base}/image-sitemap.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
