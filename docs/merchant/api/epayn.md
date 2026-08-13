# 易支付 V2 协议（epayn）

易支付 V2（epayn）是彩虹易支付新版协议，采用 **RSA-SHA256 双向签名**，安全性高于 V1 的 MD5。接口挂载在 `/xpay/epayn/` 下，兼容彩虹易支付新版 SDK。

通用约定（金额单位、订单状态）见 [API 总览](./index.md)。

::: tip 网关地址
彩虹易支付 SDK 的请求路径固定为 `apiurl + api/pay/xxx`，商户仅配置基址 `apiurl`。因此 SDK 中 `apiurl` 填 `https://你的部署域名/xpay/epayn/`，实际请求即为 `.../xpay/epayn/api/pay/submit` 等。
:::

## 密钥与签名

V2 采用 RSA-SHA256 **双向签名**：

- **商户请求**：用**商户私钥**签名，平台用**商户公钥**验签。
- **平台响应 / 回调**：平台用**平台私钥**签名，商户用**平台公钥**验签。

商户公私钥、平台公钥均在 **用户中心 → V2 协议密钥** 自助生成/获取，请妥善保管商户私钥。

### 待签名串构造

1. 取所有业务参数，**排除 `sign`、`sign_type` 及值为空的字段**。
2. 按参数名 **ASCII 升序** 排序。
3. 以 `key1=value1&key2=value2&...` 拼接（末尾无 `&`）。
4. **不追加任何密钥**（与 V1 的关键区别）。
5. 用私钥对该串做 **RSA-SHA256** 签名，结果 **Base64** 编码即为 `sign`。

> `sign_type` 固定为 `RSA`，不参与签名。所有请求需带 10 位秒级 `timestamp`。

---

## 一、页面跳转支付（submit）

```
POST/GET /xpay/epayn/api/pay/submit
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `pid` | string | 是 | 商户 ID | `10001` |
| `type` | string | 否 | 支付方式 `alipay`/`wxpay`，不传跳收银台 | `alipay` |
| `out_trade_no` | string | 是 | 商户订单号 | `ORDER20231016001` |
| `notify_url` | string | 是 | 异步通知地址 | `https://example.com/notify` |
| `return_url` | string | 否 | 同步跳转地址 | `https://example.com/return` |
| `name` | string | 是 | 商品名称 | `测试商品` |
| `money` | string | 是 | 金额（**元**） | `0.01` |
| `param` | string | 否 | 业务扩展参数 | `` |
| `clientip` | string | 否 | 用户 IP | `127.0.0.1` |
| `device` | string | 否 | 设备类型 `pc`/`mobile` | `pc` |
| `timestamp` | string | 是 | 10 位秒级时间戳 | `1697452800` |
| `sign` | string | 是 | RSA 签名 | `Base64...` |
| `sign_type` | string | 否 | 固定 `RSA` | `RSA` |

**响应**：302 跳转到收银台支付页。

---

## 二、统一下单（create）

```
POST /xpay/epayn/api/pay/create
```

**请求参数**（在 submit 基础上）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pid` | string | 是 | 商户 ID |
| `method` | string | 否 | 接口类型 `web`/`jump`/`jsapi`/`app`/`scan`/`applet`，默认 `web` |
| `device` | string | 否 | `pc`/`mobile`/`qq`/`wechat`/`alipay` |
| `type` | string | 是 | 支付方式 |
| `out_trade_no` | string | 是 | 商户订单号 |
| `notify_url` | string | 是 | 异步通知地址 |
| `return_url` | string | 否 | 同步跳转地址 |
| `name` | string | 是 | 商品名称 |
| `money` | string | 是 | 金额（**元**） |
| `auth_code` | string | 否 | 被扫支付授权码 |
| `sub_openid` | string | 否 | 用户 Openid |
| `sub_appid` | string | 否 | 公众号 AppId |
| `timestamp` | string | 是 | 10 位秒级时间戳 |
| `sign` | string | 是 | RSA 签名 |

**响应**（平台用平台私钥签名，商户须用平台公钥验签）

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | int | `0` 成功，其它失败 |
| `msg` | string | 失败原因 |
| `trade_no` | string | 平台订单号 |
| `pay_type` | string | 发起支付类型 `jump`/`qrcode`/`urlscheme`... |
| `pay_info` | string | 发起支付参数（对应 pay_type） |
| `timestamp` | string | 时间戳 |
| `sign` | string | 平台签名 |
| `sign_type` | string | `RSA` |

**响应示例**

```json
{
  "code": 0,
  "trade_no": "PAY20231016001",
  "pay_type": "qrcode",
  "pay_info": "https://qr.alipay.com/xxx",
  "timestamp": "1697452800",
  "sign": "Base64...",
  "sign_type": "RSA"
}
```

---

## 三、订单查询（query）

```
POST /xpay/epayn/api/pay/query
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pid` | string | 是 | 商户 ID |
| `trade_no` | string | 二选一 | 平台订单号 |
| `out_trade_no` | string | 二选一 | 商户订单号 |
| `timestamp` | string | 是 | 时间戳 |
| `sign` | string | 是 | RSA 签名 |

**响应**（平台签名）

| 字段 | 说明 |
|------|------|
| `code` | `0` 成功 |
| `trade_no` / `out_trade_no` / `api_trade_no` | 各订单号 |
| `type` | 支付方式 |
| `status` | 订单状态（`1` 待支付 / `2` 已支付 ...） |
| `money` | 金额（**元**） |
| `name` / `param` / `buyer` / `clientip` | 订单信息 |
| `addtime` / `endtime` | 下单 / 完成时间 |
| `timestamp` / `sign` / `sign_type` | 平台签名信息 |

---

## 四、异步回调（Notify）

订单支付成功后，平台以 **GET** 请求向 `notify_url` 推送结果，参数用**平台私钥签名**。

**回调参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| `pid` | string | 商户 ID |
| `trade_no` | string | 平台订单号 |
| `out_trade_no` | string | 商户订单号 |
| `api_trade_no` | string | 第三方交易号 |
| `type` | string | 支付方式 |
| `trade_status` | string | 交易状态，`TRADE_SUCCESS` 表示成功 |
| `name` / `money` / `param` / `buyer` | 订单信息（`money` 单位**元**） |
| `addtime` / `endtime` | 下单 / 完成时间 |
| `timestamp` | string | 时间戳 |
| `sign` | string | 平台签名 |
| `sign_type` | string | `RSA` |

**商户应答**：返回纯文本 **`success`**；否则平台重复推送。

::: warning 务必用平台公钥验签
V2 回调由平台私钥签名，商户须用**平台公钥**验签通过后再处理业务。
:::

---

## 五、暂不支持的接口

以下接口平台**暂未实现**，仍注册路由，调用时统一返回 `Not implemented`：

| 接口 | 路径 |
|------|------|
| 订单退款 | `POST /xpay/epayn/api/pay/refund` |
| 退款查询 | `POST /xpay/epayn/api/pay/refundquery` |
| 转账发起 | `POST /xpay/epayn/api/pay/transfer` |
| 转账查询 | `POST /xpay/epayn/api/pay/transfer/query` |
| 余额查询 | `POST /xpay/epayn/api/pay/balance` |

---

## V1 与 V2 对比

| 维度 | 易支付 V1 | 易支付 V2（epayn） |
|------|-----------|--------------------|
| 签名算法 | MD5 | RSA-SHA256 |
| 待签名串 | `...&key=value` + AppSecret | `...&key=value`（不加密钥） |
| 双向签名 | 否（单向） | 是（请求+响应/回调均签名验签） |
| 时间戳 | 无 | 必填 `timestamp`（10 位秒） |
| 密钥 | 1 个 AppSecret | 商户公私钥 + 平台公钥 |
| 网关路径 | `/xpay/epay/xxx.php` | `/xpay/epayn/api/pay/xxx` |

> 对安全性要求高的场景推荐 V2；追求兼容存量 SDK 可用 V1。
