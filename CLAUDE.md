# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

**重要：所有回复必须使用中文简体。**

## 项目概述

基于 VitePress 的 XArrPay（专业聚合支付系统）文档站点。内容使用 Markdown + Vue 组件编写，TailwindCSS 样式，部署至 GitHub Pages（docs.xarr.cn）。

## 常用命令

```bash
yarn install          # 安装依赖（仅使用 yarn，不要用 npm）
yarn docs:dev         # 启动开发服务器，端口 3514
yarn docs:build       # 构建静态站点至 docs/.vitepress/dist
yarn docs:preview     # 预览构建产物
```

## 架构

- `docs/.vitepress/config.ts` — VitePress 主配置：导航栏、侧边栏、Markdown 插件、站点元数据（zh-CN 语言）
- `docs/.vitepress/theme/` — 自定义主题（tabs 插件注册、TailwindCSS via PostCSS、自定义样式）
- `docs/merchant/` — 商户版文档（安装、支付通道、CLI、插件、模板、常见问题、系统对接）
- `docs/public/assets/` — 静态资源，包括 Fancybox（图片灯箱）CSS/JS
- `docs/index.md` — 首页（hero 布局）

## 关键约定

- 包管理器：仅使用 **yarn**
- 使用的 Markdown 插件：`vitepress-plugin-tabs`、`vitepress-plugin-mermaid`、`markdown-it-custom-attrs`（配合 Fancybox 实现图片灯箱）
- 图片使用 `data-fancybox="gallery"` 属性启用灯箱效果
- 侧边栏和导航栏结构定义在 `docs/.vitepress/config.ts` 中 — 新增页面时需同步更新
- 部署方式：推送至 `main` 分支后由 GitHub Actions 自动构建并部署至 GitHub Pages
