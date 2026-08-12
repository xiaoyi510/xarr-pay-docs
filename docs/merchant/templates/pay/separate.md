# 支付主题 · 分离支付页(separate.html)

`separate.html` 是**分离 / 聚合支付页**,对应路由 `GET /pay/separate/:orderId`。用于一张页面同时展示**多渠道收款**(如支付宝、微信收款码并排),用户选择任一渠道扫码支付,故称「分离/聚合」。

## 适用场景

- 一单多码:同一订单对应多个渠道(支付宝、微信、云闪付等)收款二维码;
- 聚合收银:商户希望把多支付方式放同一页面让用户自选。

## 可用变量

`separate.html` 同样注入支付模板**全套变量**,`orderInfo` 携带订单信息,`pay_account_tip` 携带渠道账号收款提示:

```html
<h1>选择支付方式</h1>
<p>订单号：${.orderInfo.order_id}</p>
<p>金额：${.orderInfo.trade_amount_text} 元</p>

<!-- 渠道收款提示(如"请核对账号信息")由后端注入 -->
${if .pay_account_tip}
    <div class="tip">${.pay_account_tip.tip}</div>
${end}
```

## 前端拉取各渠道二维码

分离页需要一次性或按用户选择拉取各渠道的二维码,由前端 JS 调 `POST /api/order/qrcode`(传 `order_id`)完成,接口返回 `type`(渠道类型)、`qrcode`(二维码图)、`content`(支付内容)等。

常用流程:

1. 页面加载拿到 `.orderInfo.order_id`;
2. 前端按渠道列表逐个调 `/api/order/qrcode`,得到各渠道的二维码并渲染;
3. 轮询 `POST /api/order/status` 判断支付完成,成功后跳转。

```javascript
// 伪代码示意
const info = await fetch('/api/order/qrcode', {method:'POST', body: JSON.stringify({order_id: ORDER_ID})});
// result.type / result.qrcode / result.content → 渲染对应渠道二维码
```

> 接口请求/响应字段以 [模板 API](/merchant/templates/pay/api) 的「获取订单二维码信息」为准。
