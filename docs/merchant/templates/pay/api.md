# 支付模板相关 API 文档

本节详细说明支付模板前端常用的后端接口，包括接口用途、请求参数、响应参数、典型响应示例及注意事项，便于开发者高效集成与调试。

:::info

**缓存提示**：

所有接口建议在请求 URL 末尾追加 `?_time=当前时间戳`，以避免部分 CDN 导致的异常缓存问题。

例如：`/api/order/info?_time=1747275686000`

:::

## 1. 获取订单信息

**接口地址**：`POST /api/order/info`

**接口说明**：

- 获取订单详情，必须首先调用，后续接口依赖本接口返回内容。
- 如果这里订单状态就已经失效,那就不需要请求后面的接口了。

### 请求参数

| 参数名       | 类型   | 必填 | 说明       |
| ------------ | ------ | ---- | ---------- |
| order_id     | string | 是   | 订单号     |
| out_order_id | string | 是   | 外部订单号 |
| pid          | int32  | 是   | 商户 ID    |

:::tip
order_id 与 out_order_id、pid 为二选一关系，不能同时为空 (版本1.4.8.3+才支持)  **一般情况请选用order_id的方式**
:::

### 响应参数

| 参数名              | 类型   | 说明                             |
| ------------------- | ------ | -------------------------------- |
| subject             | string | 订单标题                         |
| out_order_id        | string | 外部订单号                       |
| order_id            | string | 订单号                           |
| status              | int    | 订单状态码                       |
| amount              | int    | 订单金额（分）                   |
| trade_amount        | int    | 交易金额（分）                   |
| expire_time         | int    | 过期时间戳（秒）                 |
| pay_type            | string | 支付方式标识                     |
| pay_type_text       | string | 支付方式文本                     |
| create_time         | string | 创建时间                         |
| return_uri          | string | 支付完成后返回 URI（仅成功返回） |
| pay_type_logo       | string | 支付方式 logo                    |
| content             | string | 订单内容                         |
| service_qq          | string | 客服 QQ                          |
| pay_tip             | string | 支付提示                         |
| pay_payed_wait_time | int    | 支付完成后等待时间（秒）         |
| pay_account_tip     | object | 渠道账号提示信息                 |
| └─ tip              | string | 提示内容                         |
| └─ tip_cover        | int    | 提示覆盖类型                     |

### 响应示例

```json
{
  "subject": "商品购买",
  "out_order_id": "EXT20240601",
  "order_id": "202406010001",
  "status": 2,
  "amount": 1000,
  "trade_amount": 1000,
  "expire_time": 1717220000,
  "pay_type": "alipay",
  "pay_type_text": "支付宝",
  "create_time": "2024-06-01 12:00:00",
  "return_uri": "/order/return",
  "pay_type_logo": "/assets/alipay.png",
  "content": "订单内容",
  "service_qq": "123456",
  "pay_tip": "请及时支付",
  "pay_payed_wait_time": 5,
  "pay_account_tip": {
    "tip": "请核对账号信息",
    "tip_cover": 1
  }
}
```

### 订单状态码说明（orderStatus）

| 状态码 | 说明     |
| ------ | -------- |
| 1      | 待支付   |
| 2      | 支付完成 |
| 3      | 关闭     |
| 4      | 超时     |
| 5      | 创建失败 |

---

## 2. 获取订单语音播报信息

**接口地址**：`POST /api/order/audio`

### 请求参数

### 请求参数

| 参数名       | 类型   | 必填 | 说明       |
| ------------ | ------ | ---- | ---------- |
| order_id     | string | 是   | 订单号     |
| out_order_id | string | 是   | 外部订单号 |
| pid          | int32  | 是   | 商户 ID    |

:::tip
order_id 与 out_order_id、pid 为二选一关系，不能同时为空 (版本1.4.8.3+才支持)  **一般情况请选用order_id的方式**
:::

### 响应参数

| 参数名        | 类型   | 说明                              |
| ------------- | ------ | --------------------------------- |
| audio_enable  | int    | 是否启用语音播报（1 启用/0 禁用） |
| audio_url     | string | 语音播报 URL                      |
| audio_content | string | 语音内容                          |

### 响应示例

```json
{
  "audio_enable": 1,
  "audio_url": "https://cdn.example.com/audio/123.mp3",
  "audio_content": "您有一笔新订单，请及时处理。"
}
```

---

## 3. 查询订单状态

**接口地址**：`POST /api/order/status`

### 请求参数

### 请求参数

| 参数名       | 类型   | 必填 | 说明       |
| ------------ | ------ | ---- | ---------- |
| order_id     | string | 是   | 订单号     |
| out_order_id | string | 是   | 外部订单号 |
| pid          | int32  | 是   | 商户 ID    |

:::tip
order_id 与 out_order_id、pid 为二选一关系，不能同时为空 (版本1.4.8.3+才支持)  **一般情况请选用order_id的方式**
:::

### 响应参数

| 参数名              | 类型   | 说明                              |
| ------------------- | ------ | --------------------------------- |
| status              | int    | 订单状态码                        |
| expire_time         | int    | 过期时间戳（秒）                  |
| return_uri          | string | 支付完成后返回 URI（仅成功返回）  |
| is_auto_open        | int    | 是否自动打开支付页面（1 是/0 否） |
| pay_payed_wait_time | int    | 支付完成后等待时间（秒）          |

### 响应示例

```json
{
  "status": 2,
  "expire_time": 1717220000,
  "return_uri": "/order/return",
  "is_auto_open": 1,
  "pay_payed_wait_time": 5
}
```

---

## 4. 获取订单二维码信息

**接口地址**：`POST /api/order/qrcode`

**接口说明**：安全性关系,此处只能传入order_id获取

### 请求参数

| 参数名   | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| order_id | string | 是   | 订单号 |

### 响应参数

| 参数名              | 类型   | 说明                   |
| ------------------- | ------ | ---------------------- |
| type                | string | 二维码类型             |
| qrcode_data         | string | 二维码数据             |
| qrcode              | string | 二维码图片 URL         |
| scheme              | string | 支付 scheme            |
| uri                 | string | 支付 URI               |
| content             | string | 支付内容               |
| actual_amount       | string | 实际需支付金额（外部） |
| actual_account      | string | 外部支付账号           |
| actual_account_type | string | 外部支付账号类型       |

### 响应示例

```json
{
  "type": "alipay",
  "qrcode_data": "xxxxxx",
  "qrcode": "https://cdn.example.com/qrcode/123.png",
  "scheme": "alipays://platformapi/startapp?saId=10000007",
  "uri": "alipayqr://platformapi/startapp?saId=10000007",
  "content": "请使用支付宝扫码支付",
  "actual_amount": "10.00",
  "actual_account": "alipay@xxx",
  "actual_account_type": "支付宝"
}
```

---

## 5. 注意事项

- 所有接口均为 POST 请求，参数建议以 JSON 格式提交。
- 响应参数如有变动，请以实际接口返回为准。
- 建议所有请求追加 `?_time=时间戳` 避免缓存。
- 订单相关接口需先获取订单详情，后续接口依赖订单信息。

---
