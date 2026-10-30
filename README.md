<p align="center">
  <img src="./public/banner/hero-desktop.png" alt="dsh 中文手册：从一条命令，到一棵插件树">
</p>

# DeepSeek Harness 中文手册

[![ci](https://github.com/xiaomijituan/dsh-handbook/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/xiaomijituan/dsh-handbook/actions/workflows/ci.yml)

能装上、能跑通、能读懂的 dsh 指南。每页标注核验的 dsh 版本与日期；超过 30 天会显示提示条。

> 社区项目，与 DeepSeek 官方无关。官方文档面向贡献者，本仓库补上手路径、排错与版本现状。

**在线阅读：<https://xiaomijituan.github.io/dsh-handbook/>**

## 内容

- 安装：[选型](src/content/guide/install/index.mdx) · [桌面版](src/content/guide/install/desktop.mdx) · [npx](src/content/guide/install/npx.mdx) · [源码](src/content/guide/install/source.mdx)
- 插件：[总览](src/content/guide/plugins/index.mdx) · [安装与排错](src/content/guide/plugins/install.mdx) · [第一个插件](src/content/guide/plugins/first-plugin.mdx)
- 源码：[阅读顺序](src/content/guide/source/index.mdx) · [插件树](src/content/guide/source/plugin-tree.mdx) · [消息生命周期](src/content/guide/source/message-lifecycle.mdx) · [工具管线](src/content/guide/source/tool-pipeline.mdx)
- 参考：[版本](src/content/guide/versions.mdx) · [模型](src/content/guide/models.mdx) · [排错](src/content/guide/troubleshooting.mdx) · [关于](src/content/guide/about.mdx)

## 本地运行

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

## 质量门禁

```bash
npm test                 # 版本与内链检查器的单元测试
npm run check:versions   # 比对 npm dist-tags 与 GitHub tag
npm run build            # 静态构建 + Pagefind 索引
npm run check:links      # 站内链接与锚点
```

`npm run check` 会按顺序跑完以上四项。

## 版本策略

- 每页 frontmatter 的 `verified` 记录核验的 dsh 版本与日期
- `npm run versions` 生成 `src/data/versions.json`
- CI 每周比对 npm 与 GitHub 版本
- 页面核验超过 30 天会显示提示条

## 实测原则

正文只写本机跑过的命令与输出；没有证据的步骤会标注“官方文档核对”或“未实测”，不写成已验证。

## 部署

- 线上地址：<https://xiaomijituan.github.io/dsh-handbook/>，推送到 `main` 后由 `.github/workflows/deploy.yml` 自动部署
- 产物是纯静态 `dist/`，可放任意静态主机
- GitHub Pages 挂在 `/dsh-handbook/` 子路径下，构建时必须设 `BASE_PATH`；以后换成独立域名时去掉 `BASE_PATH`，内容不需要改
- 部署构建必须设置 `SITE_URL`，否则 canonical、robots 与 sitemap 会写 localhost
- 内置 `/llms.txt`（站点摘要）与 `/llms-full.txt`（全部正文），给生成式搜索引擎一次读全
- 分享图在 `/og/*.png`（1200×630）；三张源码图有独立图片 sitemap，与普通 sitemap 一起在 `robots.txt` 声明
- 分享图由 `npm run seo:og` 重新生成，首页横幅由 `npm run hero` 重新生成，均需要本机安装 Chrome（或设置 `CHROME_PATH`）

```bash
SITE_URL=https://xiaomijituan.github.io BASE_PATH=/dsh-handbook npm run build
BASE_PATH=/dsh-handbook npm run check:links
```

## 参与

- 装不上、内容过期、内容有误，各有 issue 模板
- 文章在 `src/content/guide/`，修改后跑 `npm run check`
- 涉及命令的改动，请附上系统、版本与完整输出

## 许可

- 正文：CC BY 4.0，见 [LICENSE-CONTENT](LICENSE-CONTENT)
- 代码与示例：MIT，见 [LICENSE](LICENSE)

## 如果这份手册省了你一小时

点一个 star，或在 issue 里留下一句“哪一步卡住了”。这两件事都能让下一版更好。
