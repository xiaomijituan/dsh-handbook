import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const kicker = 'DEEPSEEK HARNESS · 中文手册';
const title = '从一条命令，<br>到一棵插件树';
const lead = '安装 · 插件 · 版本 · 源码，每一步都能自己复核';
const nodes = [
  { num: '01', label: '装起来', en: 'install', color: '#86a7ff' },
  { num: '02', label: '接能力', en: 'plugins', color: '#4f9d7a' },
  { num: '03', label: '读源码', en: 'source', color: '#d3a53a' },
];

const fontSans = `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
const fontMono = `ui-monospace, SFMono-Regular, "Cascadia Code", Consolas, "Liberation Mono", monospace`;

function page() {
  const pipeline = nodes
    .map(
      (node, index) => `
      <div class="node" style="--node:${node.color}">
        <span class="num">${node.num}</span>
        <div><b>${node.label}</b><small>${node.en}</small></div>
      </div>
      ${index < nodes.length - 1 ? '<span class="wire"><i></i></span>' : ''}`,
    )
    .join('');

  const rows = Array.from({ length: 9 }, (_, index) => {
    const width = 54 + ((index * 17) % 40);
    return `<span class="row" style="--w:${width}%"><em></em><i></i></span>`;
  }).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #0e1116; color: #e9eef4; overflow: hidden; }
  body { font-family: ${fontSans}; -webkit-font-smoothing: antialiased; }
  .banner {
    position: relative;
    width: 2400px;
    height: 420px;
    padding: 0 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 60px;
    overflow: hidden;
    background: #0e1116;
  }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgb(134 167 255 / 8%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(134 167 255 / 8%) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
  }
  .glow { position: absolute; border-radius: 50%; pointer-events: none; }
  .glow--blue {
    width: 900px; height: 900px; left: -260px; top: -420px;
    background: radial-gradient(circle, rgb(47 91 215 / 36%), transparent 66%);
  }
  .glow--green {
    width: 760px; height: 760px; right: -180px; top: -360px;
    background: radial-gradient(circle, rgb(79 157 122 / 18%), transparent 66%);
  }
  .copy { position: relative; z-index: 2; width: 1020px; }
  .kicker {
    margin: 0 0 18px;
    font-family: ${fontMono};
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: #86a7ff;
  }
  h1 {
    margin: 0;
    font-size: 78px;
    line-height: 1.08;
    letter-spacing: -0.035em;
    font-weight: 700;
    color: #f3f7fb;
  }
  .lead {
    margin: 22px 0 0;
    font-size: 25px;
    line-height: 1.5;
    color: #9aa8b6;
  }
  .schematic {
    position: relative;
    z-index: 2;
    width: 1080px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .pipeline { position: relative; z-index: 3; display: flex; align-items: center; }
  .node {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 240px;
    padding: 20px 24px;
    border: 1px solid #2b3642;
    border-radius: 12px;
    background: rgb(21 26 33 / 86%);
    box-shadow: 0 18px 50px rgb(0 0 0 / 28%);
  }
  .node::before {
    content: "";
    position: absolute; inset: -1px;
    border-radius: 12px;
    border-top: 1px solid var(--node);
    opacity: 0.55;
    pointer-events: none;
  }
  .node { position: relative; }
  .num {
    font-family: ${fontMono};
    font-size: 14px;
    color: var(--node);
    align-self: flex-start;
    padding-top: 4px;
  }
  .node b { display: block; font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
  .node small {
    display: block;
    margin-top: 4px;
    font-family: ${fontMono};
    font-size: 12px;
    letter-spacing: 0.12em;
    color: #6f7d8b;
    text-transform: uppercase;
  }
  .wire { position: relative; display: block; width: 58px; height: 1px; background: #2b3642; }
  .wire i {
    position: absolute; right: 0; top: 50%;
    width: 7px; height: 7px;
    margin-top: -3.5px;
    border-radius: 50%;
    background: #86a7ff;
    box-shadow: 0 0 14px #86a7ff;
  }
  .entries {
    position: absolute;
    right: 0;
    bottom: 4px;
    width: 420px;
    display: grid;
    gap: 9px;
    opacity: 0.22;
    mask-image: linear-gradient(90deg, transparent, #000 26%);
  }
  .row { display: flex; align-items: center; gap: 8px; width: var(--w); }
  .row em {
    width: 7px; height: 7px; flex: none;
    border: 1px solid #86a7ff;
    background: rgb(134 167 255 / 30%);
  }
  .row i {
    display: block;
    height: 5px;
    width: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #86a7ff, transparent);
    opacity: 0.45;
  }
  .watermark {
    position: absolute;
    right: -10px;
    bottom: -58px;
    font-family: ${fontMono};
    font-size: 230px;
    font-weight: 700;
    letter-spacing: -0.06em;
    color: #86a7ff;
    opacity: 0.06;
    line-height: 1;
    pointer-events: none;
  }
  @media (max-width: 1100px) {
    html, body { width: 900px; height: 300px; }
    .banner {
      width: 900px;
      height: 300px;
      padding: 22px 40px 20px;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      gap: 26px;
    }
    .grid { background-size: 32px 32px; }
    .copy { width: 100%; }
    .kicker { margin-bottom: 8px; font-size: 11px; }
    h1 { font-size: 46px; line-height: 1.1; }
    .lead { display: none; }
    .schematic { width: 100%; height: auto; }
    .pipeline { width: 100%; }
    .node {
      flex: 1;
      min-width: 0;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 9px;
    }
    .node b { font-size: 16px; }
    .node small { margin-top: 1px; font-size: 8px; }
    .num { font-size: 9px; padding-top: 2px; }
    .wire { width: 18px; flex: none; }
    .wire i { width: 5px; height: 5px; margin-top: -2.5px; box-shadow: 0 0 8px #86a7ff; }
    .entries, .watermark { display: none; }
  }
</style>
</head>
<body>
  <div class="banner">
    <div class="grid"></div>
    <div class="glow glow--blue"></div>
    <div class="glow glow--green"></div>
    <div class="copy">
      <p class="kicker">${kicker}</p>
      <h1>${title}</h1>
      <p class="lead">${lead}</p>
    </div>
    <div class="schematic">
      <div class="entries">${rows}</div>
      <div class="pipeline">${pipeline}</div>
      <div class="watermark">dsh</div>
    </div>
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
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to the Chrome/Chromium executable.');
  return found;
}

const targets = [
  { name: 'hero-desktop', width: 2400, height: 420 },
  { name: 'hero-mobile', width: 900, height: 300 },
];

const htmlDir = resolve('.tmp/hero');
const outDir = resolve('public/banner');
mkdirSync(htmlDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
const chrome = chromePath();
const htmlPath = join(htmlDir, 'hero.html');
writeFileSync(htmlPath, page());

for (const target of targets) {
  const pngPath = join(outDir, `${target.name}.png`);
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${target.width},${target.height}`,
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'inherit' },
  );
  const buffer = readFileSync(pngPath);
  console.log(`${target.name}: ${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)} ${buffer.length} bytes`);
}
