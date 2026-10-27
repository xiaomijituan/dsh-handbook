import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const versions = JSON.parse(readFileSync('src/data/versions.json', 'utf8'));
const checkedAt = versions.checkedAt.slice(0, 10);

const sections = [
  {
    id: 'default',
    kicker: 'DEEPSEEK HARNESS · DEVELOPER PREVIEW',
    title: 'DeepSeek Harness 中文手册',
    lead: '能装上、能跑通、能读懂。官方文档写接口，这里补上手路径、排错与源码阅读顺序。',
    color: '#2f5bd7',
    points: ['安装与插件', '版本与排错', '源码阅读三条主线'],
  },
  {
    id: 'install',
    kicker: '安装 · INSTALL',
    title: '先把 dsh 装起来',
    lead: '桌面版、npx、源码三种方式，每一步都有失败处理。',
    color: '#d3a53a',
    points: ['npx 最短路径', '桌面版下载', '常见启动失败'],
  },
  {
    id: 'plugins',
    kicker: '插件 · PLUGINS',
    title: '插件装不上，先看这张表',
    lead: '三种安装入口、pnpm 依赖，以及装完不显示的原因。',
    color: '#4f9d7a',
    points: ['Web UI / CLI / 本地路径', 'dsh plugin 依赖 pnpm', '装完不显示看 profile'],
  },
  {
    id: 'source',
    kicker: '源码 · SOURCE',
    title: '读 dsh 源码',
    lead: `插件树、消息生命周期、工具流水线。固定到 ${versions.github.tag}。`,
    color: '#2f5bd7',
    points: ['profile → 插件树', '消息 → turn/step', '工具 → 关卡顺序'],
  },
  {
    id: 'versions',
    kicker: '版本 · VERSIONS',
    title: 'dsh 版本对照',
    lead: 'latest、next、alpha 与 GitHub tag 不是一条线。npx 默认装的不是 next。',
    color: '#cf6255',
    points: [`latest ${versions.npm.latest}`, `next ${versions.npm.next}`, `tag ${versions.github.tag}`],
  },
];

const fontSans = `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
const fontMono = `ui-monospace, SFMono-Regular, "Cascadia Code", Consolas, "Liberation Mono", monospace`;

function page(section) {
  const points = section.points
    .map((point, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${point}</li>`)
    .join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body {
    background: #f7f5ef;
    color: #101418;
    font-family: ${fontSans};
    -webkit-font-smoothing: antialiased;
  }
  .og {
    position: relative;
    width: 1200px;
    height: 630px;
    padding: 56px 64px 48px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(#ddd7ca 1px, transparent 1px),
      linear-gradient(90deg, #ddd7ca 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.28;
    pointer-events: none;
  }
  .glow {
    position: absolute;
    width: 620px;
    height: 620px;
    right: -180px;
    top: -260px;
    border-radius: 50%;
    background: radial-gradient(circle, ${section.color}22 0%, transparent 68%);
    pointer-events: none;
  }
  header, main, footer, .card { position: relative; }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-bottom: 22px;
    border-bottom: 1px solid #ddd7ca;
  }
  .brand { display: flex; align-items: baseline; gap: 14px; }
  .mark {
    font-family: ${fontMono};
    font-size: 34px;
    font-weight: 700;
    color: ${section.color};
    letter-spacing: -0.04em;
  }
  .site { font-size: 17px; color: #46525e; letter-spacing: 0.01em; }
  .tag {
    font-family: ${fontMono};
    font-size: 12px;
    color: #5f6b76;
    letter-spacing: 0.12em;
  }
  main { margin-top: 46px; max-width: 760px; }
  .kicker {
    margin: 0 0 18px;
    font-family: ${fontMono};
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: ${section.color};
  }
  h1 {
    margin: 0;
    font-size: 76px;
    line-height: 1.08;
    letter-spacing: -0.035em;
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  .lead {
    max-width: 660px;
    margin: 22px 0 0;
    font-size: 23px;
    line-height: 1.55;
    color: #46525e;
  }
  .card {
    position: absolute;
    right: 64px;
    top: 186px;
    width: 330px;
    padding: 26px 28px;
    border: 1px solid #ddd7ca;
    border-radius: 12px;
    background: #fffdf8;
    box-shadow: 0 1px 2px rgb(16 20 24 / 6%), 0 18px 40px rgb(16 20 24 / 8%);
  }
  .card__label {
    margin: 0 0 18px;
    font-family: ${fontMono};
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #5f6b76;
    text-transform: uppercase;
  }
  .card ul { margin: 0; padding: 0; list-style: none; }
  .card li {
    display: flex;
    gap: 12px;
    padding: 11px 0;
    border-top: 1px solid #ece7dc;
    font-size: 17px;
    line-height: 1.4;
  }
  .card li:first-child { border-top: 0; padding-top: 0; }
  .card li span {
    font-family: ${fontMono};
    font-size: 11px;
    color: ${section.color};
    padding-top: 3px;
  }
  footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid #ddd7ca;
    font-family: ${fontMono};
    font-size: 12px;
    color: #5f6b76;
  }
  .layers {
    position: absolute;
    left: 64px;
    bottom: 112px;
    display: flex;
    gap: 8px;
  }
  .layers span {
    display: block;
    width: 34px;
    height: 6px;
    border-radius: 3px;
    background: ${section.color};
    opacity: 0.22;
  }
  .layers span:nth-child(2) { opacity: 0.38; }
  .layers span:nth-child(3) { opacity: 0.62; }
</style>
</head>
<body>
  <div class="og">
    <div class="grid"></div>
    <div class="glow"></div>
    <header>
      <div class="brand"><span class="mark">dsh</span><span class="site">DeepSeek Harness 中文手册</span></div>
      <span class="tag">developer preview</span>
    </header>
    <main>
      <p class="kicker">${section.kicker}</p>
      <h1>${section.title}</h1>
      <p class="lead">${section.lead}</p>
    </main>
    <aside class="card">
      <p class="card__label">本页要点</p>
      <ul>${points}</ul>
    </aside>
    <div class="layers"><span></span><span></span><span></span></div>
    <footer>
      <span>dsh-handbook</span>
      <span>核验 ${checkedAt} · dsh ${versions.npm.latest}</span>
    </footer>
  </div>
</body>
</html>`;
}

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error('Chrome not found. Set CHROME_PATH to the Chrome/Chromium executable.');
  }
  return found;
}

const htmlDir = resolve('.tmp/og');
const outDir = resolve('public/og');
mkdirSync(htmlDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
const chrome = chromePath();

for (const section of sections) {
  const htmlPath = join(htmlDir, `${section.id}.html`);
  const pngPath = join(outDir, `${section.id}.png`);
  writeFileSync(htmlPath, page(section));
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'inherit' },
  );
  const buffer = readFileSync(pngPath);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  console.log(`${section.id}: ${width}x${height} ${buffer.length} bytes`);
}
