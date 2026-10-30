#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { scanText } from './lib/style-rules.mjs';

const contentDir = process.argv[2] ?? 'src/content/guide';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.mdx') ? [full] : [];
  });
}

let fails = 0;
let warns = 0;
const perFile = [];

for (const file of walk(contentDir)) {
  const findings = scanText(readFileSync(file, 'utf8'));
  const fileFails = findings.filter((item) => item.level === 'fail').length;
  const fileWarns = findings.filter((item) => item.level === 'warn').length;
  fails += fileFails;
  warns += fileWarns;
  perFile.push({ file, fails: fileFails, warns: fileWarns });
  for (const finding of findings) {
    console.log(`${finding.level.toUpperCase()} ${file}:${finding.line} [${finding.kind}] ${finding.term}`);
  }
}

for (const item of perFile.sort((a, b) => b.fails - a.fails)) {
  console.log(`SUMMARY ${item.file} fail=${item.fails} warn=${item.warns}`);
}
console.log(`style: fail=${fails} warn=${warns}`);
if (fails > 0) process.exit(1);
