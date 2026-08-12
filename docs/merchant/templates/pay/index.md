# 支付主题 · 收银台页(index.html)

支付主题是**多页面**主题,共三个页面,本页介绍**主收银台页 `index.html`**:

| 页面文件 | 对应路由 | 职责 | 文档 |
|---------|---------|------|------|
| `index.html` | `/pay/:orderId` | 收银台主页面(展示订单、引导扫码/跳转支付) | 本页 |
| `status.html` | `/pay/status` | 支付结果状态页 | [状态页开发](status) |
| `separate.html` | `/pay/separate/:orderId` | 分离/聚合支付页(多渠道收款码) | [分离支付页开发](separate) |

> 支付主题的目录结构、`manifest.json`、资源引用等**通用机制**见 [主题机制总览](/merchant/templates/overview),本节只讲收银台页本身。

## 目录结构

```
templates/pay/my_theme/
├── index.html       # 本页:收银台主页面
├── status.html      # 状态页
├── separate.html    # 分离/聚合支付页
├── assets/          # js / css / 图片
└── manifest.json    # type 必须为 3
```

## 收银台页可用变量

`index.html` 由后端在渲染时注入**支付模板全套变量**(本页为前端 JS 也注入了 `orderInfo`):

```html
<div>
    订单号：${.orderInfo.order_id}<br>
    支付方式：${.orderInfo.pay_type_text}<br>
    金额：${.orderInfo.trade_amount_text} 元<br>
    到期时间：${.orderInfo.expire_time}<br>
</div>
```

完整变量说明见 [支付模板变量](/merchant/templates/pay/variable),内置函数见 [模板函数](/merchant/templates/funcs)。

## 查询支付二维码与轮询

收银台页的核心是展示二维码并监听支付结果。前端 JS 通过 [模板 API](/merchant/templates/pay/api) 完成:

1. 后端已经把 `order_id` 注入 `.orderInfo.order_id`。
2. 前端调 `POST /api/order/qrcode`(仅传 `order_id`)获取二维码数据/URL 并渲染。
3. 定时轮询 `POST /api/order/status` 查询状态,`status==2` 视为支付完成,跳转 `return_uri` 或倒计时后跳走。

## 一个最小骨架

```html
<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${"web_title" | get_option} - 收银台</title>
    <link rel="stylesheet" href="${.templateAssets}/css/main.css">
</head>
<body>
    <h1>扫码支付</h1>
    <p>订单号：${.orderInfo.order_id}</p>
    <p>金额：${.orderInfo.trade_amount_text} 元</p>
    <!-- 二维码容器,由 JS 填充 -->
    <div id="qr"></div>
    <script src="${.templateAssets}/js/order.js"></script>
</body>
</html>
```

`assets/js/order.js` 负责调 `qrcode` / `status` 接口完成扫码展示与轮询。

## 收银台页与收银台主题的区别

> 注意不要把「支付主题的 index.html」和「收银台主题(cashier)」混淆:
> - **支付主题 `index.html`**(本页):请求 `/pay/:orderId`,注入 `orderInfo`,常配合**单笔订单的扫码页**或收银台 UI 使用。
> - **收银台主题 `cashier`**:请求 `/cashier/:key`,单页,注入变量很少(仅资源/域名),订单数据一律由前端 JS 走 API 拉取。详见 [收银台主题开发](/merchant/templates/cashier/index)。
