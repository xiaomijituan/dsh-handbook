import type { APIRoute } from 'astro';
import { absoluteBase } from '../consts';

const images = [
  {
    page: '/source/plugin-tree/',
    file: '/diagrams/plugin-tree.png',
    title: 'dsh 插件树：从 profile 到 Cordis Loader',
    caption: 'bundle 层与用户 patch 层依次叠加，composeEntries() 生成 entry 列表，再由 Cordis Loader 挂载。',
  },
  {
    page: '/source/message-lifecycle/',
    file: '/diagrams/message-lifecycle.png',
    title: 'dsh 消息生命周期：turn 与 step',
    caption: '用户 followup 进入 Inbox，经过 pre-step、提示词组装、prepareCall、请求冻结与流式结算。',
  },
  {
    page: '/source/tool-pipeline/',
    file: '/diagrams/tool-pipeline.png',
    title: 'dsh 工具管线：一次调用的关卡顺序',
    caption: '从 createExecution 到 tools/result，依次经过策略、审批、守卫、执行、内容投影与后置策略。',
  },
];

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = ({ site }) => {
  const base = absoluteBase(site);
  const urls = images
    .map(
      (image) => [
        '<url>',
        `<loc>${escape(`${base}${image.page}`)}</loc>`,
        '<image:image>',
        `<image:loc>${escape(`${base}${image.file}`)}</image:loc>`,
        `<image:title>${escape(image.title)}</image:title>`,
        `<image:caption>${escape(image.caption)}</image:caption>`,
        '</image:image>',
        '</url>',
      ].join(''),
    )
    .join('');

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
