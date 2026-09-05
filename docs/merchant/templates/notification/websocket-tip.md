# 即时消息通知

### 使用方式
Websocket

连接流程：先使用已登录会话调用 `POST /api/ws/ticket` 获取 60 秒有效、一次性使用的短期 ticket，再连接 `[ws/wss]://域名/api/ws?ticket=短期ticket`。ticket 绑定当前会话、IP 和 User-Agent，长期通信密钥不会出现在 URL 或个人中心页面。


### cmd枚举值

10000: 订单已创建
10001: 订单已支付
10002: 回调失败

40001: 商户余额不足
40002: 通道已离线
40003: 通道已上线
40004: 通道参数被修改


### 无法连接到 /api/ws 消息服务器
如使用了CDN那么需要去CDN站点开启websocket支持
