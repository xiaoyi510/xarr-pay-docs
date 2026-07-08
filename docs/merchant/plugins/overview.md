# XArrPay 插件 / 主题开发文档

本手册面向 **第三方开发者**,介绍如何为 XArrPay 开发 **支付插件、短信/推送插件** 以及 **前端主题**。

## 文档索引

| 文档 | 内容 |
|------|------|
| [快速开始](./quickstart.md) | 插件是什么、目录结构、`manifest.json` 元信息、生命周期、方法总览 |
| [支付插件开发](./pay-dev.md) | 支付插件完整开发指南:必实现方法、上下文结构、返回结构、定时任务、消息解析、最小骨架 |
| [内置函数参考](./builtin-funcs.md) | **核心速查**:插件可直接调用的全部内置模块与函数(helper / http / json / crypto / orderPayHelper / orderHelper …) |
| [短信 / 推送 / 身份认证插件](./other-plugins.md) | 短信 / 推送 / 身份认证 三类插件的接口与示例 |
| [主题开发](/merchant/templates/pay/theme-dev) | 前端主题(收银台/支付页/首页)开发、`template.json` 元信息、模板变量与内置函数 |

## 快速定位

- **插件目录**:`plugins/{pay,sms,pusher,certificate}/<插件名>/`
- **插件公共库**:`plugins/common/`(内置类型定义与工具)
- **主题目录**:`templates/{cashier,pay,index}/<主题名>/`

## 关键概念一句话

- 插件用 **Lua** 编写,每个插件是一个目录,含 `plugin.lua`(逻辑) + `manifest.json`(元信息)。
- 插件里通过 `require("autoload")` 一行,即可获得全部内置函数(`helper`、`http`、`json`、`orderPayHelper` 等),直接调用。
- 主题是 **独立的前端工程**,构建后放到对应主题目录,靠目录内的 `template.json` 被后台识别。支付主题 HTML 支持 `${...}` 模板变量与内置函数。
