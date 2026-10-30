import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { unified } from '@astrojs/markdown-remark';
import remarkContentLinks from './scripts/lib/content-links.mjs';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const contentDir = 'src/content/guide';
const lastmodByPath = new Map(
  walk(contentDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const { data } = matter(readFileSync(file, 'utf8'));
      const slug = relative(contentDir, file).replace(/\\/g, '/').replace(/\.mdx$/, '').replace(/\/index$/, '');
      return [`/${slug}/`, new Date(data.updated).toISOString()];
    }),
);

const site = process.env.SITE_URL;
const rawBase = process.env.BASE_PATH ?? '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
const basePrefix = base === '/' ? '' : base;
if (process.env.CI && !site) {
  throw new Error('SITE_URL is required in CI/deploy builds');
}
if (!site) {
  console.warn('[dsh-handbook] SITE_URL is not set; canonical, robots and sitemap will use localhost.');
}
if (basePrefix && !site) {
  console.warn(`[dsh-handbook] BASE_PATH=${basePrefix} without SITE_URL; SEO URLs will point at localhost.`);
}

export default defineConfig({
  site: site ?? 'http://localhost:4321',
  base,
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith(`${basePrefix}/search/`),
      serialize: (item) => {
        const pathname = new URL(item.url).pathname;
        const key = basePrefix && pathname.startsWith(basePrefix) ? pathname.slice(basePrefix.length) : pathname;
        const lastmod = lastmodByPath.get(key);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    processor: unified({ remarkPlugins: [[remarkContentLinks, { base: basePrefix }]] }),
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
});
