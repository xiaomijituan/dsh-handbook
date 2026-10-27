import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function extractHrefs(html) {
  return [...new Set([...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]))];
}

export function isSkippable(href) {
  return /^(https?:|mailto:|tel:|javascript:|data:)/.test(href);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function urlPathOf(distDir, file) {
  const relative = file.slice(distDir.length).replace(/\\/g, '/');
  return relative.replace(/index\.html$/, '').replace(/\.html$/, '');
}

function resolveTarget(distDir, fromUrlPath, href) {
  const url = new URL(href, `http://local${fromUrlPath}`);
  const pathname = decodeURIComponent(url.pathname);
  const absolute = join(distDir, pathname);
  if (existsSync(absolute) && statSync(absolute).isFile()) return absolute;
  if (existsSync(join(absolute, 'index.html'))) return join(absolute, 'index.html');
  if (existsSync(`${absolute}.html`)) return `${absolute}.html`;
  return null;
}

export function checkDist(distDir) {
  const broken = [];
  const files = walk(distDir).filter((file) => file.endsWith('.html'));
  const idCache = new Map();

  const idsOf = (file) => {
    if (!idCache.has(file)) {
      const html = readFileSync(file, 'utf8');
      idCache.set(
        file,
        new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])),
      );
    }
    return idCache.get(file);
  };

  for (const file of files) {
    const fromUrlPath = urlPathOf(distDir, file);
    const html = readFileSync(file, 'utf8');
    for (const href of extractHrefs(html)) {
      if (isSkippable(href) || href.startsWith('//')) continue;
      const target = resolveTarget(distDir, fromUrlPath, href);
      const hash = href.includes('#') ? href.slice(href.indexOf('#') + 1) : '';
      const label = `${fromUrlPath || '/'} -> ${href}`;
      if (!target) {
        broken.push(`${label} (missing)`);
        continue;
      }
      if (hash && !idsOf(target).has(decodeURIComponent(hash))) {
        broken.push(`${label} (dead anchor)`);
      }
    }
  }

  return { broken };
}
