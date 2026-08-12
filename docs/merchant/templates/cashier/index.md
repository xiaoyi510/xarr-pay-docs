# 收银台主题开发

收银台主题是**单页**模板,对应路由 `/cashier/:key`,主要用于展示收款二维码并引导支付。

## 目录结构

```
templates/cashier/模板名称/
├── index.html       # 收银台页面(唯一入口)
├── favicon.ico      # 可选,站点图标
├── assets/          # 静态资源(唯一可被外部访问的目录)
└── manifest.json    # type 必须为 5
```

系统内置 `templates/cashier/default/` 作为参考。

## manifest.json

```json
{
  "name": "my_cashier",
  "title": "我的收银台",
  "version": "1.0.0",
  "description": "自定义收银台模板",
  "author": "you",
  "type": 5,
  "screenshot": "screenshot.png"
}
```

> `type` 必须为 `5`(首页 `2`、支付 `3`),不能混用。

## 可用变量

收银台主题注入的变量**很少**,只有下面三个顶层变量 + `get_option` 函数:

| 变量名 | 说明 | 示例值 |
| ------ | ---- | ------ |
| `.templateAssets` | 静态资源目录 | `/templates/cashier/my_cashier/assets` |
| `.templateRoot` | 主题根目录 | `/templates/cashier/my_cashier` |
| `.domain` | 当前域名 | `pay.xarr.cn` |

:::warning
**收银台主题没有** `orderInfo` / `merchantInfo` 等后端注入变量(那些只在支付主题有)。订单、收款码等数据一律由**前端 JS 通过 API** 获取。
:::

```html
<link rel="stylesheet" href="${.templateAssets}/css/main.css">
<img src="${.templateAssets}/images/logo.png" alt="logo">
<title>${"web_title" | get_option}</title>
```

## 前端如何拿到订单数据

收银台通过 URL 参数携带订单标识(`key`),前端 JS 解析后调模板 API 获取订单与二维码:

- 解析当前页 URL 中的订单参数(key / order 标识);
- 调 `POST /api/order/qrcode` 获取二维码并渲染;
- 轮询 `POST /api/order/status` 判断支付完成。

> 接口字段以 [模板 API](/merchant/templates/pay/api) 为准。

## 收银台主题 vs 支付主题

| | 收银台主题 (cashier) | 支付主题 index.html |
|---|---|---|
| 路由 | `/cashier/:key` | `/pay/:orderId` |
| 页面数 | 单页 index.html | index / status / separate 三页 |
| 注入变量 | 仅 3 个资源/域名变量 | 全套 orderInfo 等 |
| 数据获取 | 前端 JS 走 API | 后端直接注入 + 前端可为辅助 |

两者都是「收款/收银」场景,但收银台主题更轻(纯前端驱动),支付主题数据由后端注入更完整。若你只需要「一页多码/自选渠道」,收银台主题更合适;若需要带完整订单回显、状态页、分离聚合页,用支付主题。

## 校验清单

- [ ] `index.html` 存在
- [ ] `manifest.json` 存在,`name` 与目录一致、`type`=5
- [ ] 资源引用统一用 `${.templateAssets}/`
- [ ] 订单数据由 JS 走 `/api/order/*` 获取(勿依赖后端注入 orderInfo)
