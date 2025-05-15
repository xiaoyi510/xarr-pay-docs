# 支付模板预设变量说明

本节详细介绍支付模板中可用的预设变量，包括其类型、用途及典型示例，帮助开发者高效、安全地进行模板开发。

---

## 变量语法规范

模板变量统一采用 `${.变量名}` 语法，其中：

- `${` `}`：变量包裹符号，固定格式。
- `.`：变量作用域起始标识。
- `变量名`：具体变量名称。

---

## 1. 资源与路径相关变量

| 变量名         | 类型   | 说明                   | 示例值                          |
| -------------- | ------ | ---------------------- | ------------------------------- |
| templateAssets | string | 当前主题静态资源目录   | `/templates/pay/default/assets` |
| templateRoot   | string | 当前主题根目录         | `/templates/pay/default`        |
| domain         | string | 当前访问域名           | `pay.xarr.cn`                   |
| baseUrl        | string | 请求基础网址（含协议） | `https://pay.xarr.cn`           |

---

## 2. 订单信息对象：orderInfo

`orderInfo` 为订单核心信息对象，字段如下：

| 字段                | 类型   | 说明                                                               | 示例值          |
| ------------------- | ------ | ------------------------------------------------------------------ | --------------- |
| order_id            | string | 订单唯一 ID                                                        | `202406010001`  |
| uid                 | int    | 用户 ID                                                            | `10001`         |
| status              | int    | 订单状态码（见下表）                                               | `2`             |
| status_text         | string | 订单状态文本                                                       | `支付完成`      |
| trade_amount        | int    | 交易金额（分）——用户需支付金额                                     | `1000`          |
| trade_amount_text   | string | 交易金额（元）                                                     | `10.00`         |
| actual_amount       | int    | 实际支付金额（分）                                                 | `1000`          |
| actual_account      | string | 外部收款账号                                                       | `alipay@xxx`    |
| actual_account_type | string | 外部收款账号类型                                                   | `支付宝`        |
| amount              | int    | 订单金额（分）                                                     | `1000`          |
| itime               | int    | 创建时间戳（秒）                                                   | `1717219200`    |
| utime               | int    | 更新时间戳（秒）                                                   | `1717219300`    |
| pay_time            | int    | 支付时间戳（秒）                                                   | `1717219400`    |
| expire_time         | int    | 过期时间戳（秒）                                                   | `1717220000`    |
| pay_type            | string | 支付方式标识                                                       | `alipay`        |
| pay_type_info       | object | 支付方式详细信息（见下表）                                         |                 |
| subject             | string | 订单标题                                                           | `商品购买`      |
| out_order_id        | string | 外部订单号                                                         | `EXT20240601`   |
| account_id          | int    | 账户 ID                                                            | `20001`         |
| channel_code        | string | 通道代码                                                           | `ALI_QR`        |
| api_type            | string | API 类型                                                           | `native`        |
| third_open_id       | string | 第三方 OpenID                                                      | `openid_xxx`    |
| return_uri          | string | 支付完成后返回 URI **请不要在页面直接展示,否则可能会出现盗刷问题** | `/order/return` |
| plugin_name         | string | 支付插件名称                                                       | `alipay_plugin` |

### 2.1 支付方式信息对象：pay_type_info

| 字段  | 类型   | 说明          | 示例值               |
| ----- | ------ | ------------- | -------------------- |
| logo  | string | 支付方式 logo | `/assets/alipay.png` |
| label | string | 支付方式标签  | `支付宝`             |
| value | string | 支付方式值    | `alipay`             |

---

## 3. 订单状态码说明（orderStatus）

| 状态码 | 说明     |
| ------ | -------- |
| 1      | 待支付   |
| 2      | 支付完成 |
| 3      | 关闭     |
| 4      | 超时     |
| 5      | 创建失败 |

---

## 4. 通道账号信息对象：channelAccountInfo

| 字段             | 类型   | 说明                  | 示例值    |
| ---------------- | ------ | --------------------- | --------- |
| name             | string | 通道账号名称          | `商户A`   |
| status           | int    | 状态（1 启用/2 禁用） | `1`       |
| remark           | string | 备注                  | `主账号`  |
| bind_client_name | string | 绑定客户端名称        | `客户端X` |

---

## 5. 其他常用变量

| 变量名      | 类型   | 说明               | 示例值       |
| ----------- | ------ | ------------------ | ------------ |
| contact     | string | 联系方式（如 QQ）  | `123456`     |
| server_time | int    | 服务器时间戳（秒） | `1717219500` |

---

## 6. 变量使用示例

```html
<!-- 引用静态资源 -->
<script src="${.templateAssets}/js/main.js"></script>
<!-- 显示订单金额（元） -->
<span>应付金额：${.orderInfo.trade_amount_text} 元</span>
<!-- 显示支付方式logo -->
<img src="${.orderInfo.pay_type_info.logo}" alt="支付方式" />
<!-- 显示服务器时间 -->
<span>当前时间：${.server_time}</span>
```

## 7. 变量扩展与安全建议

- 所有变量均由后端统一注入，模板中无需自行声明。
- 建议优先使用 `trade_amount_text`（元）进行金额展示，避免分/元混淆。
- 变量如为对象，访问其属性请用点号（如 `${.orderInfo.status_text}`）。
- 若需扩展变量，请联系后端开发团队，避免直接在模板中硬编码。

---
