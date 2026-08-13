# 易支付协议（V1）

XArrPay 兼容彩虹易支付 V1 协议，下游可直接复用彩虹易支付 SDK 对接。接口挂载在 `/xpay/epay/` 下，采用 **MD5 签名**。

通用约定（网关地址、金额单位、订单状态、错误码）见 [API 总览](./index.md)。

::: tip 网关地址
在下游易支付 SDK 中，商户后台/接口地址填写：`https://你的部署域名/xpay/epay/`，SDK 会自动拼接 `submit.php` / `mapi.php` / `api.php`。
:::

## 签名算法

除 `api.php`（用通讯密钥 `key` 鉴权）外，下单接口均需 MD5 签名：

1. 取所有业务参数，**排除 `sign`、`sign_type` 及值为空的字段**。
2. 按参数名 **ASCII 升序** 排序。
3. 以 `key1=value1&key2=value2&...` 拼接（末尾无 `&`）。
4. 末尾**直接追加商户密钥 AppSecret**（无分隔符）。
5. 对结果计算 **MD5**（32 位小写十六进制）。

> `sign_type` 固定为 `MD5`，且**不参与**签名计算。

---

## 一、页面跳转支付（submit.php）

用户浏览器提交后跳转到收银台完成支付，适合 Web 表单。

**请求**

```
POST/GET /xpay/epay/submit.php
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `pid` | string | 是 | 商户 ID | `10001` |
| `type` | string | 是 | 支付方式：`alipay` / `wxpay` | `alipay` |
| `out_trade_no` | string | 是 | 商户订单号 | `ORDER20231016001` |
| `name` | string | 是 | 商品名称 | `测试商品` |
| `money` | string | 是 | 金额（**元**） | `0.01` |
| `notify_url` | string | 否 | 异步通知地址 | `https://example.com/notify` |
| `return_url` | string | 否 | 同步跳转地址 | `https://example.com/return` |
| `sitename` | string | 否 | 网站名称 | `我的商城` |
| `param` | string | 否 | 业务扩展参数 | `` |
| `clientip` | string | 否 | 用户 IP | `127.0.0.1` |
| `device` | string | 否 | 设备类型 `pc`/`mobile`/`wap` | `pc` |
| `sign` | string | 是 | 签名 | `abc123...` |
| `sign_type` | string | 否 | 固定 `MD5` | `MD5` |

**响应**：302 跳转到收银台支付页；参数或签名错误时输出错误提示。

---

## 二、API 下单（mapi.php）

返回 JSON，由下游自行处理二维码 / 跳转，适合 API 集成。

**请求**

```
POST /xpay/epay/mapi.php
```

**请求参数**：同 [submit.php](#一、页面跳转支付-submit-php)（无 `sitename`）。

**响应**

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | int | `1` 成功，其它失败 |
| `msg` | string | 返回信息 |
| `trade_no` | string | 平台订单号 |
| `payurl` | string | 返回则直接跳转此地址支付 |
| `qrcode` | string | 返回则据此生成二维码 |
| `urlscheme` | string | 小程序跳转 url |
| `money` | string | 支付金额（**元**） |

**响应示例**

```json
{
  "code": 1,
  "msg": "success",
  "trade_no": "PAY20231016001",
  "qrcode": "https://qr.alipay.com/xxx",
  "money": "0.01"
}
```

---

## 三、查询接口（api.php）

用于查询商户信息与订单，通过 **通讯密钥 `key`** 鉴权（即商户 AppSecret），**不使用 MD5 签名**。

**请求**

```
POST /xpay/epay/api.php
```

**公共参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `act` | string | 是 | 操作类型：`query` / `order` / `orders` |
| `pid` | int | 是 | 商户 ID |
| `key` | string | 是 | 商户通讯密钥（AppSecret） |

### act=query 查询商户信息

返回商户 ID、状态、订单统计等。

| 响应字段 | 说明 |
|----------|------|
| `code` | `1` 成功 |
| `pid` | 商户 ID |
| `active` | `1` 正常 / `0` 封禁 |
| `orders` | 订单总数 |
| `order_today` | 今日订单数 |
| `order_lastday` | 昨日订单数 |

### act=order 查询单个订单

额外参数：`trade_no`（平台订单号）或 `out_trade_no`（商户订单号）二选一。

| 响应字段 | 说明 |
|----------|------|
| `code` | `1` 成功 |
| `trade_no` / `out_trade_no` | 订单号 |
| `type` | 支付方式 |
| `money` | 金额（**元**） |
| `status` | 订单状态 |
| `addtime` / `endtime` | 下单 / 完成时间 |

### act=orders 查询订单列表

额外参数：`page`（默认 1）、`limit`（默认 20）。返回 `data` 数组，每项字段同 `act=order`。

---

## 四、异步回调（Notify）

订单支付成功后，平台以 **GET** 请求向 `notify_url` 推送结果。

**回调参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `pid` | string | 商户 ID |
| `trade_no` | string | 平台订单号 |
| `out_trade_no` | string | 商户订单号 |
| `type` | string | 支付方式 |
| `name` | string | 商品名称 |
| `money` | string | 金额（**元**） |
| `trade_status` | string | 交易状态，`TRADE_SUCCESS` 表示成功 |
| `param` | string | 业务扩展参数 |
| `sign` | string | 签名，用 AppSecret 按上述规则验签 |
| `sign_type` | string | `MD5` |

**商户应答**：返回纯文本 **`success`**；否则平台重复推送。

::: warning 务必验签
收到回调后先用商户密钥重新计算签名并与 `sign` 比对，验签通过再处理业务，防止伪造回调。同步跳转（`return_url`）仅用于前端展示，不可作为发货依据。
:::
