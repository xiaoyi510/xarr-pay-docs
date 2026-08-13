# 插件调用约定迁移指南

::: warning 1.5.1.9 改动项
自 **v1.5.1.9** 起，框架统一了「服务端调用插件方法」的**入参与返回约定**。旧写法（多个位置参数 + JSON 字符串、`return json.encode({ err_code, err_message })`）的插件会运行报错或功能失效，第三方渠道插件作者需按本指南适配。
:::

本文面向 **已有支付插件** 的作者。若你的插件是基于 [支付插件开发](./pay-dev.md) 的新写法编写的，通常已符合新约定，仅需对照 [自检清单](#四、自检清单) 核对。

## 一、发生了什么变化

### 1. 入参：不再是「多个位置参数 + JSON 字符串」，而是「单个 ctx table」

**旧写法**（已废弃）：服务端按位置传多个参数，且参数是 JSON 字符串，插件里需要 `json.decode`：

```lua
-- ❌ 旧
function plugin.checkOrder(orderInfoJson, pluginOptions)
    local orderInfo = json.decode(orderInfoJson)   -- 对入参 decode
    ...
end
```

**新写法**：服务端把所有数据组装成**一个 Lua table** 传入，字段直接读，**不要再 `json.decode` 入参**：

```lua
-- ✅ 新
function plugin.checkOrder(ctx)
    local orderInfo = ctx.order_info               -- 直接取字段
    ...
end
```

> **底层原因**：框架现在会把 Go 结构体自动转换成 **Lua table**（不再是 JSON 字符串）。对一个 table 调用 `json.decode(...)` 会直接抛错，导致方法整体失败。

### 2. 返回：统一返回 Lua table `{ code, message, data }`，不要 `json.encode`

**旧写法**（已废弃）：

```lua
-- ❌ 旧：返回 json 字符串，且字段名是 err_code / err_message
return json.encode({ err_code = 200, err_message = "成功" })
```

**新写法**：直接 `return` 一个 table，字段名是 `code` / `message` / `data`：

```lua
-- ✅ 新
return { code = 200, message = "成功", data = { ... } }
```

### 字段对照表

| 旧 | 新 |
|----|----|
| `json.decode(入参)` | 直接读 `ctx.字段` |
| `return json.encode({...})` | `return {...}`（不 encode） |
| `err_code` | `code` |
| `err_message` | `message` |
| 顶层业务字段（如 `qrcode`、`options`） | 收进 `data` 下 |

> `code == 200` 表示成功，其它为失败/中间态。

---

## 二、逐方法迁移说明

下列方法都由**服务端主动调用**，全部适用新约定。`ctx` 的字段随方法不同。

### create / notify / render / cron / onAccountChanged / parseMessage

这些方法**大多已是新写法**（`function plugin.xxx(ctx)`）。若你的插件里还是旧写法，按上表迁移即可。各自的 `ctx` 字段见 [支付插件开发](./pay-dev.md)。

### checkOrder(ctx) — 单订单检测

`detection_type = "order"` 时，框架逐个待支付订单调用。

```lua
---@param ctx table 含 order_info / account_options
function plugin.checkOrder(ctx)
    local orderInfo = ctx.order_info          -- table: id/order_id/subject/amount/trade_amount/out_pay_data
    local accountOptions = ctx.account_options -- table: 通道账号配置
    if orderInfo and orderInfo.out_pay_data then
        -- ... 检测逻辑
    end
    return { code = 200, message = "ok" }
end
```

| ctx 字段 | 类型 | 说明 |
|----------|------|------|
| `ctx.order_info` | table | 订单信息：`id`、`order_id`、`subject`、`amount`、`trade_amount`、`out_pay_data` |
| `ctx.account_options` | table | 通道账号配置 |

### heartbeat(ctx) — 客户端心跳上报

监控端/客户端上报心跳时调用。

```lua
---@param ctx table 含 account_info / heartbeat
function plugin.heartbeat(ctx)
    local account = ctx.account_info      -- table: id/name/online/pay_type/code/plugin_name/options
    local hb = ctx.heartbeat              -- table: client_name/channel_id/ext_data
    if not hb or not hb.ext_data or hb.ext_data == "" then
        return { code = 500, message = "心跳数据解析失败" }
    end
    local extData = json.decode(hb.ext_data)  -- 注意: ext_data 仍是字符串, 需 decode
    -- ... 保存配置、置在线
    return { code = 200, message = "心跳正常" }
end
```

| ctx 字段 | 类型 | 说明 |
|----------|------|------|
| `ctx.account_info` | table | 账号信息。⚠️ `account_info.options` 仍是 **JSON 字符串**，取里面字段要 `json.decode(account_info.options)` |
| `ctx.heartbeat` | table | 心跳数据。其中 `heartbeat.ext_data` 是 **字符串**，需 `json.decode` |

### login_qrcode(ctx) / login_qrcode_check(ctx) — 扫码登录

获取登录二维码 / 轮询登录状态时调用。

```lua
---@param ctx table 含 account_info / user_info / params / device
function plugin.login_qrcode(ctx)
    local account = ctx.account_info                   -- table
    local userInfo = ctx.user_info                     -- table: id/app_secret ...
    local option = json.decode(account.options)        -- options 仍是字符串
    -- ... 请求第三方拿二维码
    return {
        code = 200,
        message = "请扫码登录",
        data = {
            qrcode = qr_url,                           -- 二维码内容/URL
            options = json.encode({ uid = uid }),      -- ⚠️ 必须是字符串, 服务端原样存入登录令牌
        }
    }
end

---@param ctx table 含 account_info / user_info / params
function plugin.login_qrcode_check(ctx)
    local vParams = json.decode(ctx.params or "{}")    -- params 是字符串, 需 decode
    local account = ctx.account_info
    -- ... 查询第三方登录状态
    -- 待扫码/进行中: 返回非 200
    -- return { code = 201, message = "请扫描二维码登录" }
    -- 登录成功:
    return { code = 200, message = "登录成功", data = { can_bind_token = false } }
end
```

| ctx 字段 | 类型 | 说明 |
|----------|------|------|
| `ctx.account_info` | table | 账号信息；`account_info.options` 仍是 **字符串** |
| `ctx.user_info` | table | 商户信息，直接读 `id`、`app_secret` 等，**不要** decode |
| `ctx.params` | **字符串** | 前端/令牌透传参数，取字段前 `json.decode(ctx.params or "{}")` |
| `ctx.device` | table | 设备信息（可能为 nil，一般用不到） |

**返回约定**：

- `login_qrcode` 成功：`{ code=200, data={ qrcode=..., options=<字符串> } }`。`data.options` **必须是字符串**（用 `json.encode` 包一层），会被服务端原样保存到登录令牌，供 `login_qrcode_check` 通过 `ctx.params` 取回。
- `login_qrcode_check`：`code=200` 表示登录成功；待扫码/进行中返回 `code=201`（或其它非 200）；`data.can_bind_token` 可选。

### parseMessage(ctx) — App 短信/推送金额匹配

框架在匹配 App 转发的短信/通知时，对**待支付订单所属渠道**的插件调用，传入单个 `PluginParseMsg` table。

```lua
local message_parser = require("message_parser")

---@param ctx table PluginParseMsg { pay_type, channel_code, title, content, package_name }
function plugin.parseMessage(ctx)
    -- ctx 已是 table, 直接用, 不要 json.decode
    return message_parser.parse(ctx, rules)   -- 命中返回 { code=200, data={ amount, channel_code } }
end
```

::: danger 命名冲突警告
`parseMessage` 是**框架保留方法名**，签名固定为单参数 `(ctx)`。
云端 websocket 收款类插件（如 `yun_wechat_*`）里若有自定义的消息解析逻辑，**不要**命名为 `plugin.parseMessage`——否则一旦该渠道有待支付订单，App 上报时框架会误调它、传入的参数与你的自定义签名错位导致报错。请改用私有名，如 `plugin._parseWsMessage`（官方 `yun_wechat_ipad` 已采用此约定）。
:::

### action_*(ctx) — 自定义账号动作

后台「运行动作」调用，方法名以 `action_` 开头。

```lua
---@param ctx table 含 account_info / account_options / channel_info / user_info / params
function plugin.action_wake(ctx)
    local account = ctx.account_info
    local option = json.decode(account.options)  -- options 仍是字符串
    -- ... 执行动作
    return { code = 200, message = "唤醒成功" }
end
```

| ctx 字段 | 类型 | 说明 |
|----------|------|------|
| `ctx.account_info` | table | 账号信息；`options` 为字符串 |
| `ctx.account_options` | table | 已解析的账号配置 |
| `ctx.channel_info` | table | 渠道信息 |
| `ctx.user_info` | table | 商户信息 |
| `ctx.params` | 视传入而定 | 动作参数 |

### check_account 等 crontab_list 任务（scope = account）

`crontab_list` 里 `scope = "account"` 的任务，框架逐账号调用，传入 `CronAccountParams`：

```lua
---@param ctx table 含 account_info / account_options / plugin_option / args
function plugin.check_account(ctx)
    local account = ctx.account_info
    local options = ctx.account_options   -- ⚠️ 已是解析好的 table, 不要再 decode
    -- ...
    return { code = 200, message = "查询成功" }
end
```

> 注意与 `heartbeat`/`login_*` 的区别：crontab 任务的 `ctx.account_options` 是**已解析的 table**，而 `account_info.options` 在其它场景可能仍是字符串。以本指南各方法表格为准。

### websocket 回调 onConnect / onMessage / onError / onClose(ctx)

使用 `websocket.dial` 注册回调的插件，框架回调时也统一传入单个 ctx table。

```lua
local conn_id = websocket.dial(url, {
    options   = json.encode({ id = accountInfo.id, uid = accountInfo.uid }),  -- 自定义选项(字符串)
    onConnect = "onConnect",
    onMessage = "onMessage",
    onError   = "onError",
    onClose   = "onClose",
})

---@param ctx table { conn_id, options, message }
function plugin.onConnect(ctx)
    local opt = json.decode(ctx.options)   -- options 是 dial 时传入的字符串
    helper.channel_account_online(opt.id)
end

---@param ctx table message = { type, data }
function plugin.onMessage(ctx)
    local opt = json.decode(ctx.options)
    local text = ctx.message.data          -- 收到的原始文本
    -- ... 解析收款并入账
end

---@param ctx table message 为错误信息字符串
function plugin.onError(ctx) log.info(ctx.message) end

---@param ctx table message 为关闭原因字符串
function plugin.onClose(ctx)
    local opt = json.decode(ctx.options)
    helper.channel_account_offline(opt.id)
end
```

| ctx 字段 | 类型 | 说明 |
|----------|------|------|
| `ctx.conn_id` | 字符串 | 连接 ID |
| `ctx.options` | **字符串** | `websocket.dial` 时传入的 `options`，需 `json.decode` |
| `ctx.message` | 字符串 / table | onConnect/onError/onClose 为字符串；onMessage 为 `{ type, data }`，`data` 是收到的原始文本 |

---

## 三、常见坑

1. **对 table 调 `json.decode`**：新入参已是 table，`json.decode(ctx.account_info)` 会直接报错让整个方法失败。只有明确标注为「字符串」的字段（如 `ctx.params`、`account_info.options`、`heartbeat.ext_data`）才需要 decode。
2. **返回值忘了去掉 `json.encode`**：服务端现在期望 table，返回字符串会解析失败。
3. **字段名没改**：`err_code`/`err_message` 要改成 `code`/`message`。
4. **`data.options` 忘了包成字符串**：`login_qrcode` 的 `data.options` 必须 `json.encode`，否则登录令牌存取异常。
5. **成功分支漏改**：迁移时容易只改错误分支，记得把「成功 return」也一起改。

## 四、自检清单

- [ ] 方法签名改成 `function plugin.xxx(ctx)`（单参数）
- [ ] 所有 `json.decode(入参)` 已删除，改为 `ctx.字段`（字符串字段除外）
- [ ] 所有 `return json.encode({...})` 改为 `return {...}`
- [ ] `err_code` → `code`，`err_message` → `message`
- [ ] 业务字段（qrcode 等）收进 `data`
- [ ] `login_qrcode` 的 `data.options` 用 `json.encode` 包成字符串
- [ ] 用 `luac -p plugin.lua` 校验语法无误

## 五、可参考的官方迁移样例

以下插件已按新约定迁移，可对照：

| 方法 | 参考插件 |
|------|----------|
| `checkOrder` | `plugins/pay/jdsyt` |
| `heartbeat` | `plugins/pay/ck_lakala_app`、`plugins/pay/jk_wechat_skd_xd` |
| `login_qrcode` / `login_qrcode_check` | `plugins/pay/yun_wechat_xd`、`plugins/pay/yun_wechat_imac` |
| `action_*` | `plugins/pay/alipay_auto_deploy`、`plugins/pay/yun_wechat_ipad` |
| `check_account`（crontab account） | `plugins/pay/ck_lakala_app` |
| `parseMessage`（单 ctx table） | `plugins/pay/jk_wechat`、`plugins/pay/jk_alipay` |
| websocket 回调 + 自定义解析改私有名 | `plugins/pay/yun_wechat_ipad`（`_parseWsMessage`） |
