#!/usr/bin/env node
import { checkDist } from './lib/links.mjs';

const distDir = process.argv[2] ?? 'dist';
const rawBase = process.env.BASE_PATH ?? '/';
const basePrefix = rawBase === '/' ? '' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
const { broken } = checkDist(distDir, { basePrefix });

if (broken.length > 0) {
  for (const item of broken) console.error(`BROKEN ${item}`);
  process.exit(1);
}
console.log(`links ok: ${distDir}`);
