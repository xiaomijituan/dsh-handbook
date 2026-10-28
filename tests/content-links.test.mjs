import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveContentUrl } from '../scripts/lib/content-links.mjs';

const contentDir = '/site/src/content/guide';

test('同目录的 .mdx 链接改写成站内路由', () => {
  assert.equal(
    resolveContentUrl('/site/src/content/guide/install/index.mdx', 'desktop.mdx', contentDir),
    '/install/desktop/',
  );
});

test('跨目录与 index.mdx 链接改写成站内路由', () => {
  assert.equal(
    resolveContentUrl('/site/src/content/guide/install/index.mdx', '../plugins/index.mdx', contentDir),
    '/plugins/',
  );
  assert.equal(
    resolveContentUrl('/site/src/content/guide/source/plugin-tree.mdx', '../versions.mdx', contentDir),
    '/versions/',
  );
});

test('保留锚点与查询串', () => {
  assert.equal(
    resolveContentUrl('/site/src/content/guide/install/source.mdx', 'npx.mdx#确认服务起来了', contentDir),
    '/install/npx/#确认服务起来了',
  );
});

test('外链、站内绝对路径与非 mdx 链接原样保留', () => {
  assert.equal(
    resolveContentUrl('/site/src/content/guide/a.mdx', 'https://example.com/x.mdx', contentDir),
    'https://example.com/x.mdx',
  );
  assert.equal(resolveContentUrl('/site/src/content/guide/a.mdx', '/install/npx/', contentDir), '/install/npx/');
  assert.equal(resolveContentUrl('/site/src/content/guide/a.mdx', './diagram.png', contentDir), './diagram.png');
});

test('越出内容目录的链接原样保留', () => {
  assert.equal(
    resolveContentUrl('/site/src/content/guide/a.mdx', '../../../README.mdx', contentDir),
    '../../../README.mdx',
  );
});
