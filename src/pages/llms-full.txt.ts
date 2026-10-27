import type { APIRoute } from 'astro';
import matter from 'gray-matter';
import versions from '../data/versions.json';

const files = import.meta.glob('../content/guide/**/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const groups: { heading: string; slugs: string[] }[] = [
  { heading: '开始', slugs: ['about', 'models', 'troubleshooting'] },
  { heading: '安装', slugs: ['install', 'install/npx', 'install/desktop', 'install/source'] },
  { heading: '插件', slugs: ['plugins', 'plugins/first-plugin', 'plugins/install'] },
  { heading: '源码', slugs: ['source', 'source/plugin-tree', 'source/message-lifecycle', 'source/tool-pipeline'] },
  { heading: '版本', slugs: ['versions'] },
];

const slugOf = (path: string) => path.replace('../content/guide/', '').replace(/\.mdx$/, '').replace(/\/index$/, '');

const pages = new Map(
  Object.entries(files).map(([path, raw]) => {
    const { data, content } = matter(raw);
    return [slugOf(path), { data, content: content.trim() }];
  }),
);

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('http://localhost:4321')).href.replace(/\/$/, '');
  const absolutize = (body: string) =>
    body
      .replace(/(\]\()\/(?!\/)/g, `$1${base}/`)
      .replace(/((?:src|href)=")\/(?!\/)/g, `$1${base}/`);

  const lines: string[] = [
    '# DeepSeek Harness 中文手册 · 全文',
    '',
    '> 面向 dsh（DeepSeek Harness）的中文实战手册：安装、插件、排错与源码阅读。',
    `> 核验基准：npm latest ${versions.npm.latest}，GitHub tag ${versions.github.tag}，核验于 ${versions.checkedAt.slice(0, 10)}。`,
    '> 社区项目，与 DeepSeek 官方无关。每页正文前保留核验日期，便于判断时效。',
    '',
    '本文件按站点导航顺序收录全部正文，供生成式搜索引擎一次读取。逐页摘要见 /llms.txt。',
    '',
  ];

  let index = 0;
  for (const group of groups) {
    for (const slug of group.slugs) {
      const page = pages.get(slug);
      if (!page) continue;
      index += 1;
      const data = page.data;
      lines.push('---', '', `# ${index}. ${data.title}`, '');
      lines.push(`> ${data.description}`, '');
      lines.push(`摘要：${data.answer}`, '');
      const updated = new Date(data.updated).toISOString().slice(0, 10);
      lines.push(`核验：dsh ${data.verified.dsh}，${updated}；原文 ${base}/${slug}/`, '');
      lines.push(absolutize(page.content), '');
      if (data.faq?.length) {
        lines.push('## 常见问题', '');
        for (const item of data.faq) lines.push(`### ${item.q}`, '', item.a, '');
      }
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
