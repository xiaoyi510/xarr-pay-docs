# 微信支付-Native（V3）

微信支付 Native 支付适用于 PC 网站场景，用户打开电脑上的网页，扫码完成支付。本通道使用微信支付 APIv3 接口。

## 所需资料

### 1. 微信支付商户号

获取位置：[微信支付商户平台](https://pay.weixin.qq.com) → 账户中心 → 商户信息

- **商户号**：页面顶部直接显示（格式如 `16xxxxx`）

### 2. APIv3 密钥

获取位置：[微信支付商户平台](https://pay.weixin.qq.com) → 账户中心 → API安全 → APIv3密钥

- 点击"设置密钥"，自行设置一个 32 位的密钥字符串

### 3. API证书

获取位置：[微信支付商户平台](https://pay.weixin.qq.com) → 账户中心 → API安全 → API证书

- 点击"申请证书"，按照指引下载证书文件
- 需要的文件：`apiclient_key.pem`（商户私钥）和 `apiclient_cert.pem`（商户证书）

### 4. AppID

需要一个与商户号关联的应用 AppID，可以是以下任意一种：

- **公众号 AppID**：[微信公众平台](https://mp.weixin.qq.com) → 开发 → 基本配置
- **小程序 AppID**：[微信小程序平台](https://mp.weixin.qq.com) → 开发 → 开发管理 → 开发设置

::: tip 提示
确保 AppID 已在微信支付商户平台 → 产品中心 → AppID账号管理 中完成关联绑定。
:::

## 配置说明

在 XArrPay 后台添加微信 Native 通道时，填写以下信息：

| 配置项 | 说明 |
|--------|------|
| AppID | 关联的公众号或小程序 AppID |
| 商户号 | 微信支付商户号 |
| APIv3 密钥 | 商户平台设置的 32 位密钥 |
| 商户私钥 | `apiclient_key.pem` 文件内容 |
| 商户证书 | `apiclient_cert.pem` 文件内容 |
