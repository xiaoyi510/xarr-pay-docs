# 外部 API 上报接口文档

所有接口返回统一结构：

```json
{
  "code": 200,
  "message": "xx",
  "data": null
}
```

---

## 1. 上报通知消息类型

- **接口地址**：`/api/report/{pid}`
- **请求方式**：`POST`
- **说明**：上报通知类的信息。
- **路径参数**：
  - `pid`：商户 ID
- **签名方法**：与正常签名方法一致

### 请求参数

| 字段      | 类型   | 必填 | 说明                            |
| --------- | ------ | ---- | ------------------------------- |
| from      | string | 是   | 来源                            |
| content   | string | 是   | 内容（JSON 字符串，见下方结构） |
| timestamp | string | 是   | 时间戳                          |
| sign      | string | 是   | 签名                            |

#### content 字段结构（短信发送器类型 SmsForwarderItem）

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| from         | string | 来源号码 |
| package_name | string | APP 包名 |
| app_name     | string | APP 名称 |
| title        | string | 通知标题 |
| msg          | string | 通知内容 |
| receive_time | string | 接收时间 |
| device_name  | string | 设备名称 |

**content 示例：**

```json
{
  "from": "1069000000",
  "package_name": "com.example.app",
  "app_name": "示例APP",
  "title": "通知标题",
  "msg": "通知内容",
  "receive_time": "2024-01-01 12:00:00",
  "device_name": "设备A"
}
```

**完整请求示例：**

```bash
curl -X POST "https://yourdomain.com/api/report/123456" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "sms",
    "content": "{\"from\":\"1069000000\",\"package_name\":\"com.example.app\",\"app_name\":\"示例APP\",\"title\":\"通知标题\",\"msg\":\"通知内容\",\"receive_time\":\"2024-01-01 12:00:00\",\"device_name\":\"设备A\"}",
    "timestamp": "1710000000",
    "sign": "xxxxxx"
  }'
```

---

## 2. 上报具体金额类型

- **接口地址**：`/api/report/{pid}/pc`
- **请求方式**：GET/POST
- **说明**：上报支付信息。
- **路径参数**：
  - `pid`：商户 ID

### 请求参数

| 字段               | 类型   | 必填 | 说明                           |
| ------------------ | ------ | ---- | ------------------------------ |
| amount             | int    | 是   | 支付金额                       |
| pay_type           | string | 是   | 支付类型（qqpay/alipay/wxpay） |
| channel_code       | string | 是   | 支付通道代码                       |
| remark             | string | 否   | 备注                           |
| pay_time           | string | 否   | 支付时间                       |
| coll_user          | string | 否   | 收款账号                       |
| pay_user           | string | 否   | 付款账号                       |
| uid                | string | 否   | 用户 ID                        |
| order_id           | string | 否   | 订单号                         |
| out_order_id       | string | 否   | 本平台订单号                   |
| channel_account_id | int    | 否   | 渠道账号 ID                    |
| timestamp          | string | 是   | 时间戳                         |
| sign               | string | 是   | 签名                           |

**POST 请求示例：**

```bash
curl -X POST "https://yourdomain.com/api/report/123456/pc" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "pay_type": "alipay",
    "channel_code": "ali_qr",
    "remark": "测试订单",
    "pay_time": "2024-01-01 12:00:00",
    "coll_user": "收款账号A",
    "pay_user": "付款账号B",
    "uid": "user001",
    "order_id": "order123",
    "out_order_id": "outorder456",
    "channel_account_id": 789,
    "timestamp": "1710000000",
    "sign": "xxxxxx"
  }'
```

**GET 请求示例：**

```bash
curl "https://yourdomain.com/api/report/123456/pc?amount=100&pay_type=alipay&channel_code=ali_qr&timestamp=1710000000&sign=xxxxxx"
```

---

## 3. 上报心跳

- **接口地址**：`/api/report/{pid}/heart`
- **请求方式**：GET/POST
- **说明**：客户端上报心跳信息。
- **路径参数**：
  - `pid`：商户 ID

### 请求参数

| 字段        | 类型   | 必填 | 说明                                           |
| ----------- | ------ | ---- | ---------------------------------------------- |
| client_name | string | 是   | 客户端名称（类似分组）                         |
| channel_id  | int    | 否   | 指定渠道 ID                                    |
| ext_data    | string | 否   | 心跳扩展数据（JSON 字符串,将会传递给插件使用） |
| timestamp   | int    | 是   | 时间戳                                         |
| sign        | string | 是   | 签名                                           |

**POST 请求示例：**

```bash
curl -X POST "https://yourdomain.com/api/report/123456/heart" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "客户端A",
    "channel_id": 1,
    "ext_data": "{\"key\":\"value\"}",
    "timestamp": 1710000000,
    "sign": "xxxxxx"
  }'
```

**GET 请求示例：**

```bash
curl "https://yourdomain.com/api/report/123456/heart?client_name=客户端A&timestamp=1710000000&sign=xxxxxx"
```

---

## 返回值说明

所有接口返回如下结构：

| 字段    | 类型   | 说明                  |
| ------- | ------ | --------------------- |
| code    | int    | 状态码（200 为成功）  |
| message | string | 提示信息              |
| data    | any    | 数据内容，默认为 null |

**返回示例：**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

