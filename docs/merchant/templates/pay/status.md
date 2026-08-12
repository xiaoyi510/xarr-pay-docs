# 支付主题 · 状态页(status.html)

`status.html` 是支付**结果状态页**,对应路由 `GET /pay/status`,通常在收银台页轮询到订单 `status==2`(支付完成)后跳转到这里展示支付结果。

## 适用时机

- 收银台页轮询判断订单已支付完成;
- 用户在支付完成后被引导(或手动访问)`/pay/status?order_id=xxx`。

## 可用变量

状态页同样由后端注入**支付模板全套变量**,最关键的是 `.orderInfo.status` / `.orderInfo.status_text` 用于区分结果:

| 状态码 | 说明 |
|-------|------|
| 1 | 待支付 |
| 2 | 支付完成 |
| 3 | 关闭 |
| 4 | 超时 |
| 5 | 创建失败 |

```html
<div>
    ${if eq .orderInfo.status 2}
        <h1>支付成功 ✅</h1>
        <p>订单号：${.orderInfo.order_id}</p>
        <p>支付金额：${.orderInfo.trade_amount_text} 元</p>
        <!-- 支付完成后的跳转地址(仅在支付完成时由后端注入) -->
        ${if .orderInfo.return_uri}
            <a href="${.orderInfo.return_uri}">返回商户</a>
        ${end}
    ${else}
        <h1>${.orderInfo.status_text}</h1>
    ${end}
</div>
```

## 建议的做法

1. **先查状态**:页面加载时由后端注入的 `.orderInfo` 直接渲染结果(无需额外请求);若需更实时,前端可再调 `POST /api/order/status`。
2. **成功跳转**:`return_uri` 仅在支付完成时才由后端注入,`${if .orderInfo.return_uri}` 判断即可安全展示;页面可给出「倒计时后自动跳转」。
3. **失败安抚**:订单关闭/超时/创建失败时,展示对应的 `.orderInfo.status_text`,并可保留客服联系方式(`${.contact}`)。

> 完整变量见 [支付模板变量](/merchant/templates/pay/variable),状态码与 `status_text` 的分发由后端完成,模板只需判断渲染。
