# V免签对接

V免签是一个免签约支付监控方案，通过安卓手机监控收款通知实现自动回调。XArrPay 支持作为下游对接 V免签系统。

## 前置条件

- 已部署 V免签服务端：[vmqphp](https://github.com/szvone/vmqphp)
- 已安装 V免签安卓监控端：[VmqApk](https://github.com/szvone/VmqApk)

## 对接配置

在 XArrPay 后台添加 V免签对接时，需要填写以下信息：

| 配置项 | 说明 |
|--------|------|
| 网关地址 | V免签服务端地址，如 `http://vmq.xxxx.com/` |
| 易支付地址 | V免签系统中的易支付接口地址 |

::: tip 提示
确保 V免签服务端已正常运行且安卓监控端在线，否则无法正常接收支付回调。
:::
