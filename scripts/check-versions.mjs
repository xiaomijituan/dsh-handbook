#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { evaluatePages } from './lib/versions.mjs';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src/content/guide');
const OUT_FILE = join(ROOT, 'src/data/versions.json');
const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const write = args.has('--write');

function fetchJson(url, attempts = 2) {
  const headers = ['-H', 'Accept: application/vnd.github+json'];
  if (process.env.GITHUB_TOKEN) {
    headers.push('-H', `Authorization: Bearer ${process.env.GITHUB_TOKEN}`);
  }
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const text = execFileSync(
        'curl',
        [
          '-sS',
          '--http1.1',
          '--retry',
          '3',
          '--retry-all-errors',
          '--retry-delay',
          '1',
          '--max-time',
          '25',
          ...headers,
          url,
        ],
        { encoding: 'utf8' },
      );
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function collectPages() {
  return walk(CONTENT_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const data = matter(readFileSync(file, 'utf8')).data;
      return {
        id: relative(CONTENT_DIR, file)
          .replace(/\.mdx$/, '')
          .replace(/\\/g, '/')
          .replace(/\/index$/, ''),
        verified: data.verified,
      };
    });
}

let npm = { latest: '', next: '', alpha: '' };
let ghTag = '';
try {
  const registry = fetchJson('https://registry.npmjs.org/@deepseek-ai/dsh');
  npm = {
    latest: registry['dist-tags'].latest ?? '',
    next: registry['dist-tags'].next ?? '',
    alpha: registry['dist-tags'].alpha ?? '',
  };
  const releases = fetchJson(
    'https://api.github.com/repos/deepseek-ai/deepseek-harness/releases?per_page=10',
  );
  ghTag = Array.isArray(releases) && releases[0] ? releases[0].tag_name : '';
} catch (error) {
  console.error(`version source unreachable: ${error.message}`);
  if (!write) process.exit(1);
}

const pages = collectPages();
const { errors, warnings } = evaluatePages(pages, { now: Date.now(), npm, ghTag });

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

if (write && npm.latest) {
  mkdirSync(join(ROOT, 'src/data'), { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        npm,
        github: { tag: ghTag },
        pages: pages.map((page) => ({
          id: page.id,
          dsh: page.verified?.dsh ?? null,
          date: page.verified?.date
            ? new Date(page.verified.date).toISOString().slice(0, 10)
            : null,
        })),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`wrote ${OUT_FILE}`);
}

if (strict && errors.length > 0) process.exit(1);
