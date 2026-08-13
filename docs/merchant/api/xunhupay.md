# 虎皮椒协议

XArrPay 兼容虎皮椒（XunHuPay）下单协议，下游可复用虎皮椒 SDK 对接。接口挂载在 `/xpay/hupijiao/` 下，采用 **MD5 签名**，签名字段名为 `hash`（而非 `sign`）。

通用约定（金额单位、订单状态）见 [API 总览](./index.md)。

::: tip 网关地址
虎皮椒 SDK 中的接口网关填写：`https://你的部署域名/xpay/hupijiao/`。
:::

## 签名算法

虎皮椒使用 `hash` 字段签名，规则：

1. 取所有业务参数，**排除 `hash` 及值为空的字段**。
2. 按参数名 **ASCII 升序** 排序。
3. 以 `key1=value1&key2=value2&...` 拼接（末尾无 `&`）。
4. 末尾**直接追加商户密钥 AppSecret**（无分隔符）。
5. 对结果计算 **MD5**（32 位小写十六进制），即为 `hash`。

> 与易支付 V1 的唯一区别：签名字段名是 `hash`，排除的字段是 `hash`（易支付排除的是 `sign`/`sign_type`）。

---

## 一、创建订单

```
POST /xpay/hupijiao
或 POST /xpay/hupijiao/payment/do.html
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `version` | string | 是 | API 版本号，目前 `1.1` | `1.1` |
| `appid` | string | 是 | 支付渠道 ID（即商户 ID） | `10001` |
| `trade_order_id` | string | 是 | 商户订单号（唯一） | `ORDER20231016001` |
| `total_fee` | string | 是 | 订单金额（**元**，精确到分） | `0.01` |
| `title` | string | 是 | 订单标题（≤128 字符） | `测试商品` |
| `time` | string | 是 | 当前时间戳（秒） | `1697452800` |
| `notify_url` | string | 是 | 异步通知地址（**不能含 `&`**） | `https://example.com/notify` |
| `nonce_str` | string | 是 | 随机字符串（防缓存/防猜测） | `abc123def456` |
| `hash` | string | 是 | 签名 | `abc123...` |
| `return_url` | string | 否 | 支付成功跳转地址 | `https://example.com/return` |
| `callback_url` | string | 否 | 取消支付跳转地址 | `https://example.com/cancel` |
| `plugins` | string | 否 | 接入程序/作者标识 | `myshop` |
| `attach` | string | 否 | 备注，回调原样返回 | `` |
| `type` | string | 否 | 支付类型：微信 H5 填 `WAP`，微信小程序填 `JSAPI`（支付宝不填） | `WAP` |
| `wap_url` | string | 否 | 网站域名（H5/小程序必填） | `https://example.com` |
| `wap_name` | string | 否 | 网站名称（H5 必填，≤32 字符） | `我的商城` |

**响应**

| 字段 | 类型 | 说明 |
|------|------|------|
| `oderid` | string | 订单 ID（历史遗留字段名，一般无需使用） |
| `url_qrcode` | string | 二维码地址（PC 端扫码支付，自行生成二维码） |
| `url` | string | 支付链接（移动端/H5，直接跳转，自动判断渠道） |
| `errcode` | string | 错误码，`0` 成功，其它失败（如 `402`） |
| `errmsg` | string | 错误信息，成功为空 |
| `hash` | string | 响应签名，可按签名算法验签 |

**成功响应示例**

```json
{
  "oderid": "PAY20231016001",
  "url_qrcode": "https://pay.example.com/api/qrcode?text=...",
  "url": "https://pay.example.com/pay/PAY20231016001",
  "errcode": "0",
  "errmsg": "",
  "hash": "a1b2c3d4..."
}
```

**失败响应示例**

```json
{
  "errcode": "402",
  "errmsg": "校验信息错误",
  "hash": "b2c3d4e5..."
}
```

---

## 二、查询订单

```
POST /xpay/hupijiao/payment/query.html
```

::: warning 开发中
该查询接口暂在完善中。查单请优先使用异步回调，或通过 [XArrPay 原生协议 · 查询订单状态](./xarrpay.md#三、查询订单状态) 查询。
:::

---

## 三、异步回调（Notify）

订单支付成功后，平台以 **POST** 请求（`application/x-www-form-urlencoded`）向 `notify_url` 推送结果。

**回调参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `trade_order_id` | string | 商户订单号 |
| `total_fee` | string | 支付金额（**元**） |
| `transaction_id` | string | 平台交易号 |
| `open_order_id` | string | 平台内部订单号 |
| `order_title` | string | 订单标题 |
| `status` | string | 订单状态，固定 `OD`（支付完成） |
| `plugins` | string | 下单时传入的 plugins（传入才返回） |
| `appid` | string | 支付渠道 ID |
| `time` | string | 支付完成时间戳（秒） |
| `nonce_str` | string | 随机字符串 |
| `hash` | string | 签名，用 AppSecret 按上述规则验签 |

**商户应答**：返回包含 `success`、`成功` 或 `ok` 的内容即视为成功；否则平台重复推送。

::: warning 务必验签
收到回调后先用商户密钥重新计算 `hash` 并与回调值比对，验签通过再处理业务，防止伪造回调。
:::
