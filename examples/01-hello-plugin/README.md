# 第一个插件（最小可加载版）

这是一个最小的 DeepSeek Harness 插件：只导出 `name` 与 `apply()`，加载时打印一行日志。它不注册工具，所以不需要任何依赖，适合验证“插件能不能被加载”。

## 开发时用 patch 覆盖层加载

在 dsh 仓库或任意目录创建一份 patch 文件，把 `name` 指向本文件绝对路径：

```yaml
- insert:
    - id: hello
      name: '/absolute/path/to/dsh-handbook/examples/01-hello-plugin/index.js'
```

然后启动 Web UI：

```bash
dsh web --patch ./hello.patch.yml
```

启动日志里出现 `[hello-plugin] plugin loaded!` 就说明加载成功。

## 打包成组合包

`package.json` 已声明 `dsh.bundle.patch`，`cordis.patch.yml` 按包名引用自身。把它安装进一个测试 profile：

```bash
dsh plugin --profile hello add ./examples/01-hello-plugin
dsh --profile hello --dump-config
```

`dsh plugin` 会把参数转发给 pnpm，因此本机必须先有 pnpm。

## 下一步

要注册一个模型可调用的工具，按官方 `adding-a-tool` 文档在 `apply()` 里使用 `ctx.tools.register(defineTool(...))`，并让包依赖 `@deepseek-ai/dsh-tools`。
