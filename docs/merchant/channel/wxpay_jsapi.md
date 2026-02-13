# 微信支付-JSAPI

::: warning 注意
由于 JSAPI 需要验证域名，目前为了安全起见，需要站长辅助验证。
:::

## 所需资料

### 1. 公众号 AppID 和 AppSecret

获取位置：[微信公众平台](https://mp.weixin.qq.com) → 开发 → 基本配置

- **AppID**：页面直接显示
- **AppSecret**：点击"重置"后获取（仅显示一次，请妥善保存）

### 2. 微信支付商户号

获取位置：[微信支付商户平台](https://pay.weixin.qq.com) → 账户中心 → 商户信息

- **商户号**：页面顶部直接显示（格式如 `16xxxxx`）

### 3. APIv3 密钥

获取位置：[微信支付商户平台](https://pay.weixin.qq.com) → 账户中心 → API安全 → APIv3密钥

- 点击"设置密钥"，自行设置一个 32 位的密钥字符串

### 4. API证书

获取位置：[微信支付商户平台](https://pay.weixin.qq.com) → 账户中心 → API安全 → API证书

- 点击"申请证书"，按照指引下载证书文件
- 需要的文件：`apiclient_key.pem`（商户私钥）和 `apiclient_cert.pem`（商户证书）
