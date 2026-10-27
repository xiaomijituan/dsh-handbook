#!/usr/bin/env node
import { checkDist } from './lib/links.mjs';

const distDir = process.argv[2] ?? 'dist';
const { broken } = checkDist(distDir);

if (broken.length > 0) {
  for (const item of broken) console.error(`BROKEN ${item}`);
  process.exit(1);
}
console.log(`links ok: ${distDir}`);
