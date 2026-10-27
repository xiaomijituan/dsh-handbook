import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { extractHrefs, isSkippable, checkDist } from '../scripts/lib/links.mjs';

test('extractHrefs 只取 href', () => {
  const html = '<a href="/a/">a</a><a href="/b/#x">b</a><img src="/c.png">';
  assert.deepEqual(extractHrefs(html).sort(), ['/a/', '/b/#x']);
});

test('isSkippable 跳过外链与协议链接', () => {
  assert.equal(isSkippable('https://x.com'), true);
  assert.equal(isSkippable('mailto:a@b.c'), true);
  assert.equal(isSkippable('/install/'), false);
});

test('checkDist 找到断链与死锚点', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-links-'));
  mkdirSync(join(dir, 'a'), { recursive: true });
  mkdirSync(join(dir, 'b'), { recursive: true });
  writeFileSync(join(dir, 'a/index.html'), '<a href="/b/">ok</a><a href="/missing/">bad</a>');
  writeFileSync(join(dir, 'b/index.html'), '<h2 id="here">x</h2>');
  writeFileSync(join(dir, 'c.html'), '<a href="/b/#nope">dead anchor</a>');
  const { broken } = checkDist(dir);
  assert.ok(broken.some((item) => item.includes('/missing/')));
  assert.ok(broken.some((item) => item.includes('#nope')));
  assert.ok(!broken.some((item) => item.endsWith('-> /b/')));
});
