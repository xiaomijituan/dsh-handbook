import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import versions from '../data/versions.json';
import { absoluteBase, formatCheckedDate } from '../consts';

const groups: { heading: string; slugs: string[] }[] = [
  { heading: '开始', slugs: ['about', 'models', 'troubleshooting'] },
  { heading: '安装', slugs: ['install', 'install/npx', 'install/desktop', 'install/source'] },
  { heading: '插件', slugs: ['plugins', 'plugins/first-plugin', 'plugins/install'] },
  { heading: '源码', slugs: ['source', 'source/plugin-tree', 'source/message-lifecycle', 'source/tool-pipeline'] },
  { heading: '版本', slugs: ['versions'] },
];

const slugOf = (id: string) => id.replace(/\/index$/, '');

export const GET: APIRoute = async ({ site }) => {
  const base = absoluteBase(site);
  const entries = await getCollection('guide', ({ data }) => !data.noindex);
  const bySlug = new Map(entries.map((entry) => [slugOf(entry.id), entry]));

  const lines: string[] = [
    '# DeepSeek Harness 中文手册',
    '',
    '> 面向 dsh（DeepSeek Harness）的中文实战手册：安装、插件、排错与源码阅读。',
    '> 每页标注核验版本与日期。',
    `> 核验基准：npm latest ${versions.npm.latest}，GitHub tag ${versions.github.tag}，核验于 ${formatCheckedDate(versions.checkedAt)}。`,
    '',
    '官方文档写接口与设计，这里补上手路径、排错，以及一条能自己复核的源码阅读顺序。',
    '安装优先看 npx 一页；插件装不上先看插件目录页的排查表；源码按插件树 → 消息生命周期 → 工具管线的顺序读。',
    '',
  ];

  for (const group of groups) {
    const items = group.slugs.filter((slug) => bySlug.has(slug));
    if (items.length === 0) continue;
    lines.push(`## ${group.heading}`, '');
    for (const slug of items) {
      const entry = bySlug.get(slug)!;
      lines.push(`- [${entry.data.title}](${base}/${slug}/): ${entry.data.description}`);
    }
    lines.push('');
  }

  const listed = new Set(groups.flatMap((group) => group.slugs));
  const rest = entries.filter((entry) => !listed.has(slugOf(entry.id)));
  if (rest.length > 0) {
    lines.push('## 其他', '');
    for (const entry of rest) {
      lines.push(`- [${entry.data.title}](${base}/${slugOf(entry.id)}/): ${entry.data.description}`);
    }
    lines.push('');
  }

  lines.push('## 可选', '', `- [全文合集](${base}/llms-full.txt): 全部页面正文，按导航顺序排列`, `- [站点地图](${base}/sitemap-index.xml)`, '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
