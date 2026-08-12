# 模板变量

不同主题类型的 HTML 在渲染时注入的模板变量**不同**。首页与收银台注入极少(仅 3 个),支付主题注入全套(订单/商户/通道等)。下表为各类型可用变量的总览。

## 各类型注入变量对比

| 变量 | 首页 | 收银台 | 支付页 |
|------|:---:|:---:|:---:|
| `.templateAssets` 静态资源目录 | ✅ | ✅ | ✅ |
| `.templateRoot` 主题根目录 | ✅ | ✅ | ✅ |
| `.domain` 当前域名 | ✅ | ✅ | ✅ |
| `.baseUrl` 请求基础网址(含协议) | — | — | ✅ |
| `.orderInfo` 订单信息对象 | — | — | ✅ |
| `.merchantInfo` 商户信息对象 | — | — | ✅ |
| `.channelAccountInfo` 通道账号信息 | — | — | ✅ |
| `.pay_account_tip` 收款账号提示 | — | — | ✅ |
| `.payed_wait_time` 支付后等待时间 | — | — | ✅ |
| `.server_time` 服务器时间戳 | — | — | ✅ |
| `.pay_tip` 支付提示 | — | — | ✅ |
| `.contact` 联系方式 | — | — | ✅ |
| `get_option(key)` 读站点配置函数 | ✅ | ✅ | ✅ |

- **首页、收银台**主题的数据通常由前端 JS 通过 [模板 API](/merchant/templates/pay/api) 拉取(如订单二维码),模板层只注入资源路径与域名。
- **支付主题**的数据由后端直接注入(`orderInfo` 等),无需额外请求订单详情。

## 变量语法

模板变量统一采用 `${.变量名}` 语法:

- `${` `}`:变量包裹符号,固定格式。
- `.`:变量作用域起始标识。
- `变量名`:具体变量名称。

```html
<script src="${.templateAssets}/js/main.js"></script>
```

> 所有变量均由后端统一注入,模板中无需自行声明。变量为对象时,访问其属性用点号(如 `${.orderInfo.status_text}`)。

## 各类型详细变量

- **支付主题**:在页面可直接使用 `orderInfo` 全套字段,见 [支付模板变量](/merchant/templates/pay/variable)。
- **首页主题**:完整变量清单见 [首页模板开发](/merchant/templates/index/dev) 第三节。
- **收银台主题**:完整变量清单见 [收银台主题开发](/merchant/templates/cashier/index)。
