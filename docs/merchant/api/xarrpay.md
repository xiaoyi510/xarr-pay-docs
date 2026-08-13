# XArrPay 原生协议

XArrPay 原生协议是平台自带的对外支付接口，采用 MD5 签名，字段语义清晰，推荐新接入的下游系统使用。所有接口挂载在 `/xpay/` 网关下。

通用约定（网关地址、统一响应结构、金额单位、订单状态、错误码）见 [API 总览](./index.md)。

## 签名算法

所有请求均需携带 `sign`，生成规则：

1. 取所有业务参数（**排除 `sign` 及值为空的字段**）。
2. 按参数名 **ASCII 升序** 排序。
3. 以 `key1=value1&key2=value2&...` 拼接，末尾不带 `&`。
4. 在末尾**直接拼接商户密钥 AppSecret**（无分隔符）。
5. 对结果计算 **MD5**（32 位小写十六进制）。

**示例**（假设 AppSecret 为 `mysecret`）：

待签名参数：`money=0.01`、`name=测试商品`、`out_trade_no=ORDER001`、`pay_type=alipay`、`pid=10001`

```
拼接串： money=0.01&name=测试商品&out_trade_no=ORDER001&pay_type=alipay&pid=10001mysecret
sign  = md5(拼接串) = 32位小写十六进制
```

::: tip
回调验签使用相同算法：取回调参数（排除 `sign`）按上述规则计算后与回调携带的 `sign` 比对。
:::

---

## 一、创建订单（API 下单）

获取支付二维码 / 跳转链接 / 唤起地址，由下游自行处理展示与跳转，适合 API 集成、移动端、SDK 场景。

**请求**

```
POST /xpay/order/create
Content-Type: application/json 或 application/x-www-form-urlencoded
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `pid` | int | 是 | 商户 ID | `10001` |
| `pay_type` | string | 是 | 支付方式：`alipay` / `wxpay` / `qqpay` 等 | `alipay` |
| `name` | string | 是 | 商品名称 | `测试商品` |
| `money` | string | 是 | 订单金额（**单位：元**） | `0.01` |
| `out_trade_no` | string | 是 | 商户订单号（商户维度唯一） | `ORDER20231016001` |
| `notify_url` | string | 否 | 异步通知地址 | `https://example.com/notify` |
| `return_url` | string | 否 | 同步跳转地址 | `https://example.com/return` |
| `clientip` | string | 否 | 用户 IP，缺省取请求来源 IP | `127.0.0.1` |
| `device` | string | 否 | 设备类型 `pc` / `mobile` / `wap`，缺省按 UA 判断 | `pc` |
| `param` | string | 否 | 业务扩展参数，原样回传于回调 | `` |
| `sign` | string | 是 | 请求签名 | `abc123...` |

**响应 `data`**

| 字段 | 类型 | 说明 |
|------|------|------|
| `trade_no` | string | 平台订单号 |
| `out_trade_no` | string | 商户订单号（回显） |
| `expire_time` | int | 订单支付超时时间（Unix 时间戳，秒） |
| `pay_type` | string | 支付方式 |
| `amount` | string | 订单金额（**元**） |
| `trade_amount` | string | 实际应支付金额（**元**） |
| `uri` | string | 支付跳转地址（H5 支付时使用） |
| `qrcode` | string | 支付二维码内容（扫码支付时使用） |
| `scheme` | string | 唤起支付的地址（App 支付时使用） |

**响应示例**

```json
{
  "code": 200,
  "msg": "创建成功",
  "data": {
    "trade_no": "PAY20231016001",
    "out_trade_no": "ORDER20231016001",
    "expire_time": 1697452800,
    "pay_type": "alipay",
    "amount": "0.01",
    "trade_amount": "0.01",
    "uri": "https://pay.example.com/pay/PAY20231016001",
    "qrcode": "https://qr.alipay.com/xxx",
    "scheme": "alipays://platformapi/xxx"
  }
}
```

> `uri` / `qrcode` / `scheme` 按支付方式与设备返回其中一种或多种，下游择一使用。

---

## 二、创建页面订单（表单下单）

与「创建订单」参数完全一致，但**成功后直接 302 重定向到收银台支付页面**，适合 H5 / Web 表单直接提交、无需自行处理跳转的场景。

**请求**

```
POST /xpay/order/create-page
Content-Type: application/json 或 application/x-www-form-urlencoded
```

请求参数同 [创建订单](#一、创建订单-api-下单)。

**响应**

- 成功：HTTP 302 跳转至收银台支付页 `/pay/{trade_no}`。
- 失败：直接在页面输出错误提示，不返回 JSON。

**与「创建订单」的区别**

| 特性 | 创建订单 `/order/create` | 创建页面订单 `/order/create-page` |
|------|--------------------------|-----------------------------------|
| 响应格式 | JSON（含 qrcode/uri/scheme） | 302 重定向到收银台 |
| 跳转处理 | 下游自行处理 | 平台自动跳转 |
| 适用场景 | API 集成 / 移动端 / SDK | H5 / Web 表单提交 |

---

## 三、查询订单状态

**请求**

```
POST /xpay/order/status
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `out_order_id` | string | 是 | 商户订单号 | `ORDER20231016001` |
| `pid` | int | 是 | 商户 ID | `10001` |
| `sign` | string | 是 | 请求签名 | `abc123...` |

**响应 `data`**

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | int | 订单状态：`1` 待支付 / `2` 已支付 / `3` 已关闭 / `4` 超时 / `5` 创建失败 |
| `expire_time` | int | 订单过期时间（Unix 时间戳，秒） |
| `return_uri` | string | 同步跳转地址（**仅已支付时返回**） |

**响应示例**

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": 2,
    "expire_time": 1697452800,
    "return_uri": "https://example.com/return?pid=10001&..."
  }
}
```

---

## 四、关闭订单

关闭待支付订单。已支付或已关闭的订单无法关闭。

**请求**

```
POST /xpay/order/cancel
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `out_order_id` | string | 二选一 | 商户订单号（与 `order_id` 二选一） | `ORDER20231016001` |
| `order_id` | string | 二选一 | 平台订单号（与 `out_order_id` 二选一） | `PAY20231016001` |
| `pid` | int | 是 | 商户 ID | `10001` |
| `timestamp` | int | 是 | 请求时间戳（秒） | `1697452800` |
| `sign` | string | 是 | 请求签名 | `abc123...` |

**响应示例**

```json
{ "code": 200, "msg": "订单关闭成功", "data": null }
```

失败时 `code` 非 200，如订单已支付返回「订单已支付，无法关闭」。

---

## 五、获取渠道列表

获取商户当前**在线可用**的支付渠道账号列表。

**请求**

```
POST /xpay/user-channels
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `pid` | int | 是 | 商户 ID | `10001` |
| `timestamp` | int | 否 | 时间戳 | `1697452800` |
| `sign` | string | 是 | 请求签名（按表单参数计算） | `abc123...` |

**响应 `data`**（数组，每项为一个渠道）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 渠道账号 ID |
| `name` | string | 渠道账号名称 |
| `code` | string | 渠道代码 |
| `pay_type` | string | 支付方式 |
| `remark` | string | 备注 |
| `min_amount` | int | 单笔最小金额（**分**） |
| `max_amount` | int | 单笔最大金额（**分**） |
| `day_amount` | int | 日限额（**分**） |

---

## 六、异步回调（Notify）

订单支付成功后，平台向下单时提交的 `notify_url` 推送支付结果。

**回调方式**

- 默认 **POST**，`Content-Type: application/x-www-form-urlencoded`（可在后台改为 GET）。
- 超时时间约 1 分钟；未收到成功应答会**重复推送**，请做好幂等处理。

**回调参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `pid` | string | 商户 ID |
| `trade_no` | string | 平台订单号 |
| `out_trade_no` | string | 商户订单号 |
| `pay_type` | string | 支付方式 |
| `name` | string | 商品名称 |
| `amount` | int | 订单金额（**分**） |
| `trade_amount` | int | 实际支付金额（**分**） |
| `param` | string | 下单时的业务扩展参数 |
| `status` | int | 订单状态，`2` 表示已支付 |
| `sign` | string | 回调签名，用商户密钥按上述签名算法验签 |

**商户应答**

- 处理成功：返回纯文本 **`success`**（响应体包含 `success` 即视为成功，平台停止重推）。
- 处理失败：返回任意非 `success` 内容，平台按重试策略继续推送。

::: warning 务必验签
收到回调后，请先用商户密钥对参数（排除 `sign`）重新计算签名并与回调 `sign` 比对，验签通过再处理业务，防止伪造回调。
:::

---

## 七、同步跳转（Return）

用户在收银台支付成功后，浏览器被重定向到下单时提交的 `return_url`，参数通过 URL 查询串传递，字段与异步回调一致：

```
https://example.com/return?pid=10001&trade_no=PAY20231016001&out_trade_no=ORDER20231016001&pay_type=alipay&name=测试商品&amount=100&trade_amount=100&status=2&param=&sign=abc123...
```

::: tip
同步跳转仅用于前端页面展示，**不可作为发货依据**。发货与业务处理请以异步回调（或主动调用查询接口）为准。
:::
