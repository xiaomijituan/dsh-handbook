import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText } from '../scripts/lib/style-rules.mjs';

const kinds = (findings) => findings.map((item) => `${item.level}:${item.kind}:${item.term}`);

test('语域黑名单与"读者"命中即失败，代码块内的内容不算', () => {
  const text = ['---', 'title: "x"', '---', '', '读者会遇到这个坑，我们顺手兜底。', '', '```', 'npm install 坑', '```'].join('\n');
  const findings = scanText(text).filter((item) => item.level === 'fail');
  assert.deepEqual(kinds(findings).filter((item) => item.startsWith('fail:语域错位')), [
    'fail:语域错位:坑',
    'fail:语域错位:兜底',
    'fail:语域错位:顺手',
  ]);
  assert.ok(findings.some((item) => item.kind === '人称错位'));
});

test('"怎么验证"不算疑问式口语，标题里的"怎么"算', () => {
  const text = ['## 装完怎么确认成功', '', '先按回车，怎么验证是否生效。'].join('\n');
  const findings = scanText(text);
  assert.ok(findings.some((item) => item.kind === '疑问式标题'));
  assert.ok(!findings.some((item) => item.term === '怎么验'));
});

test('自称词整页超过 3 次告失败', () => {
  const text = ['本章说明甲。', '', '本节说明乙。', '', '这一节说明丙。', '', '这里补充一点。'].join('\n');
  assert.ok(scanText(text).some((item) => item.kind === '自称词过量'));
});

test('"其它"不触发悬空代词，"它的上一级"触发', () => {
  assert.ok(!scanText(['其它情况见下。'].join('\n')).some((item) => item.kind === '悬空代词'));
  assert.ok(scanText(['它的上一级会盖掉这一行。'].join('\n')).some((item) => item.kind === '悬空代词'));
});

test('frontmatter 里会显示到页面上的文案也参与检查', () => {
  const text = ['---', 'title: "x"', 'answer: "两步都不是把循环炸掉的异常"', 'faq:', '  - q: "有什么区别？"', '    a: "guards 是它之后的检查"', '---', '', '正文没有黑名单词。'].join('\n');
  const findings = scanText(text);
  assert.ok(findings.some((item) => item.kind === '语域错位' && item.line === 3));
  assert.ok(findings.some((item) => item.kind === '悬空代词' && item.line === 6));
  assert.ok(!findings.some((item) => item.line === 2));
});

test('这套文章与本系列计入自称词', () => {
  const text = ['这套文章讲甲。', '', '本系列讲乙。', '', '这套文章讲丙。', '', '本系列讲丁。'].join('\n');
  assert.ok(scanText(text).some((item) => item.kind === '自称词过量'));
});
