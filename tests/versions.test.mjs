import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVersion, minorDistance, evaluatePages } from '../scripts/lib/versions.mjs';

test('parseVersion 接受带 rc 的版本', () => {
  assert.deepEqual(parseVersion('0.2.1-rc.2'), {
    major: 0,
    minor: 2,
    patch: 1,
    pre: 'rc',
    preNum: 2,
  });
});

test('parseVersion 拒绝非法格式', () => {
  assert.equal(parseVersion('v0.2'), null);
  assert.equal(parseVersion(''), null);
});

test('minorDistance 跨 minor 计数', () => {
  assert.equal(minorDistance('0.2.1-rc.2', '0.2.1-rc.4'), 0);
  assert.equal(minorDistance('0.2.0', '0.3.1'), 1);
  assert.equal(minorDistance('0.2.0', '1.0.0'), 998);
});

test('evaluatePages 缺 verified 是错误', () => {
  const { errors } = evaluatePages(
    [{ id: 'a', verified: undefined }],
    {
      now: Date.parse('2026-10-27'),
      npm: { latest: '0.2.1-rc.2', next: '0.2.1-rc.4', alpha: '0.2.1-alpha.5' },
      ghTag: 'dsh-v0.2.1-rc.3',
    },
  );
  assert.equal(errors.length, 1);
});

test('evaluatePages 对旧版本只报警告，不报错', () => {
  const { errors, warnings } = evaluatePages(
    [{ id: 'a', verified: { dsh: '0.1.7-rc.2', date: '2026-09-24' } }],
    {
      now: Date.parse('2026-10-27'),
      npm: { latest: '0.2.1-rc.2', next: '0.2.1-rc.4', alpha: '0.2.1-alpha.5' },
      ghTag: 'dsh-v0.2.1-rc.3',
    },
  );
  assert.equal(errors.length, 0);
  assert.ok(warnings.some((warning) => warning.includes('not in current tags')));
  assert.ok(warnings.some((warning) => warning.includes('days ago')));
});
