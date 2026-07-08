# 02 · 支付插件开发

支付插件位于 `plugins/pay/<插件名>/`,包含 `manifest.json` + `plugin.lua`。本文讲解 `plugin.lua` 需要实现的方法、接收的上下文、返回结构。所有类型定义见 `plugins/common/types.lua`,内置函数见 [内置函数参考](./builtin-funcs.md)。

---

## 一、pluginInfo() — 声明能力(必需)

声明本插件支持的支付渠道、全局选项、定时任务、配置项。返回 `types.PluginInfo`。

```lua
function plugin.pluginInfo()
    ---@type types.PluginInfo
    return {
        -- 支持的支付类型 → 渠道数组。key 为支付大类:alipay/wxpay/qqpay/bank...
        channels = {
            ["alipay"] = { {
                label = '易支付',        -- 渠道显示名
                value = 'alipay_epay',   -- 渠道唯一 code
                -- bind_pay_type = {...},-- (可选)绑定的支付类型数组
                -- sms_types = {...},    -- (短信插件用)支持的短信类型
                options = {              -- (可选)渠道级选项
                    use_add_amount = 1,  -- 使用递增金额(金额去重)
                    use_qrcode_login = 1,-- 使用扫码登录流程
                    to_app_create = 1,   -- 需要重新创建
                }
            } },
            ["wxpay"] = { { label = '易支付', value = 'wxpay_epay' } },
        },
        options = {
            callback = 1,             -- 是否支持异步回调(1=是,框架会路由回调到 notify)
            detection_interval = 3,   -- 主动检测间隔(分钟);0=不检测
            detection_type = "cron",  -- 检测方式:"order"=逐单检查 / "cron"=定时任务
            -- 定时任务列表(见"定时任务"章节)
            crontab_list = {
                { crontab = "*/50 * * * * *", fun = "sync_rate", name = "同步费率" },
            },
            -- 插件级配置项:启动时自动写入系统配置,后台可改;用 helper.get_plugin_option 读取
            options = {
                { title = "接口地址", key = "api_host", default = "https://api.example.com" },
                { title = "费率", key = "rate", default = "1.00" },
            }
        }
    }
end
```

> ⚠️ 注意区分两个 `options`:
> - `pluginInfo().options` —— 插件全局选项对象(callback/detection_interval/crontab_list/…)。
> - `pluginInfo().options.options` —— 插件级配置项数组,启动时初始化进系统配置,通过 `helper.get_plugin_option(pluginName, key, default)` 读取。

## 二、formItems(ctx) — 通道账号配置表单(必需)

声明"添加通道账号"时后台展示的表单。返回 `types.FormResponse`。用户填写的值,后续在 `create`/`notify` 里通过 `ctx.account_options[name]` 取到。

```lua
---@param ctx types.FormContext   -- { pay_type, pay_channel, ext }
---@return types.FormResponse
function plugin.formItems(ctx)
    return {
        inputs = {
            {
                name = 'pid',                       -- 字段名(account_options 的 key)
                label = '商户ID',                   -- 标签
                type = types.InputTypes.INPUT,      -- 输入类型,见下表
                default = "",                       -- 默认值
                placeholder = "请输入商户ID",
                hidden_list = 1,                    -- (可选)在账号列表中隐藏该字段值
                when = "...",                       -- (可选)条件显示表达式,见下
                options = { tip = '如: 10000' },    -- (可选)字段附加选项
                rules = {                           -- (可选)校验规则,等价 Element Form Rules
                    { required = true, trigger = { "input", "blur" }, message = "请输入" }
                }
            },
            {
                name = 'method', label = '请求方式', type = types.InputTypes.SELECT,
                default = "POST",
                values = {                          -- select/单选的选项数组
                    { label = "GET", value = "GET" },
                    { label = "POST", value = "POST" },
                }
            },
        }
    }
end
```

### 输入类型 `types.InputTypes`

| 常量 | 值 | 说明 |
|------|----|----|
| HIDDEN | hidden | 隐藏域 |
| INPUT | input | 单行文本 |
| PASSWORD | password | 密码框 |
| TEXTAREA | textarea | 多行文本 |
| SELECT | select | 下拉(配 `values`) |
| RADIO | radio | 单选(配 `items`/`values`) |
| CHECKBOX | checkbox | 复选 |
| IMAGE | image | 图片上传 |
| FILE | file | 文件上传 |
| CHOSE_PROXY_POOL | chose_proxy_pool | 代理池选择 |
| NUMBER | number | 数字 |
| EMAIL / URL | email / url | 邮箱 / URL |
| DATE / TIME / DATETIME | date / time / datetime | 日期时间 |
| TIPS | tips | 纯提示文本 |

### 字段选项 `options`(`types.FormFieldOptions`)

`tip`(提示)、`chose_gateway`(是否选择网关)、`append_deqrocde`(是否附加解析二维码功能)、`qrcode_type`、`proxy_type` 等。

### 条件显示 `when`

一个 JS 表达式字符串,前端 eval,`true` 才显示该字段。变量前缀固定为 `this.formModel.options.`。示例(阿里云短信插件):

```lua
when = "!this.formModel.options.sms_service_type or this.formModel.options.sms_service_type == 'send_sms'"
```

## 三、create(ctx) — 创建订单(必需)

发起支付的核心。返回 `types.OrderCreateResp`。

### 入参 `ctx`(`types.OrderCreateParams`)

```lua
ctx = {
    order_info      = types.PayOrderInfo,  -- 订单信息(见下)
    account_info    = types.AccountInfo,   -- 通道账号信息
    device          = types.DeviceInfo,    -- 设备/环境信息
    account_options = table,               -- 通道账号配置(formItems 填写的值)
    plugin_options  = table,               -- 系统插件配置
}
```

**`order_info`(`types.PayOrderInfo`)常用字段:**

| 字段 | 类型 | 说明 |
|------|------|------|
| pay_type | string | 支付类型 |
| id | number | 订单 ID |
| order_id | string | 平台订单号 |
| subject | string | 订单标题 |
| trade_amount | number | 交易金额(**分**) |
| trade_amount_str | string | 交易金额(元,字符串) |
| notify_url | string | 异步通知地址 |
| return_url | string | 同步返回地址 |
| third_open_id | string | 第三方 OpenID |
| client_ip | string | 客户端 IP |
| device | string | 设备类型 |
| host | string | 主机地址 |
| timestamp | number | 时间戳 |

**`account_info`(`types.AccountInfo`)** 有 `id / uid / name / code / pay_type / min_amount / max_amount / day_amount / online / options / ext / time_limit_type / ...`(完整字段见公共库 `types.lua`)。

**`device`(`types.DeviceInfo`)**:`is_mobile / is_pc / is_alipay / is_wechat / is_qq / is_browser / user_agent / client_ip / from_qrcode / host / domain`。

### 返回 `types.OrderCreateResp`

```lua
return {
    code = 200,            -- 200 成功,其余为失败(message 会展示给用户)
    message = "success",
    data = {
        type = types.PaymentResultTypes.QRCODE, -- 结果类型,决定前端如何展示
        -- 按 type 提供对应字段:
        qrcode = "...",        -- 二维码内容(type=qrcode)
        qrcode_file = "...",   -- 二维码图片文件路径(可选)
        url = "...",           -- 跳转链接(type=jump)
        content = "<html>..",  -- HTML 内容(type=html)
        html = "<form>..",     -- 表单(type=form)
        out_trade_no = "...",  -- 外部交易号(可选,便于对账)
        -- 递增金额 / 指定收款账号类渠道常用:
        actual_amount = "10.50",         -- 实际应付金额
        actual_account_type = "bank",    -- 实际收款账号类型
        actual_account = "6222xxxx",     -- 实际收款账号
    }
}
```

### 结果类型 `types.PaymentResultTypes`

| 常量 | 值 | 前端行为 |
|------|----|--------|
| QRCODE | qrcode | 展示二维码(`qrcode`/`qrcode_file`) |
| JUMP | jump | 跳转到 `url` |
| HTML | html | 渲染 `content` 内 HTML(常用于自动提交表单) |
| FORM | form | 表单提交 |
| ERROR | error | 错误页 |

## 四、notify(ctx) — 异步回调(支持回调时必需)

第三方支付成功后回调本平台时触发。**核心是:验签 → 校验状态 → 调 `orderHelper.notify_process` 通知框架完成订单**。

### 入参 `ctx`(`types.OrderNotifyParams`)

```lua
ctx = {
    request = {           -- types.OrderNotifyRequest
        method = "POST",  -- 或 "GET"
        body = table,     -- 解析后的请求体(POST)
        body_string = "", -- 原始请求体
        query = table,    -- URL 查询参数(GET)
        header = table,   -- 请求头
    },
    account_info    = types.AccountInfo,
    order_info      = { id, order_id, subject, amount, trade_amount },
    account_options = table,
}
```

### 完成订单

```lua
-- 通知框架完成订单;三个参数均为 JSON 字符串
local err_code, err_message, response = orderHelper.notify_process(
    json.encode({
        out_trade_no = "平台订单号",  -- 对应 order_id
        trade_no     = "第三方交易号",
        amount       = 1000,          -- 实收金额(分)
    }),
    json.encode(ctx.params),          -- 原始回调参数
    json.encode(ctx.account_options)  -- 通道账号配置
)

return {
    code = err_code,                  -- 200 表示处理成功
    message = err_message,
    data = { response = response }    -- response 是应答给第三方的内容(如 "success")
}
```

## 五、定时任务

两种触发方式,由 `pluginInfo().options` 决定:

### 方式 A:`crontab_list`(推荐,精确控制)

```lua
options = {
    detection_type = "cron",
    crontab_list = {
        -- crontab:6 段(含秒) 或 5 段;fun:要调用的 plugin.<fun> 方法名;name:任务名
        { crontab = "*/50 * * * * *", fun = "sync_rate", name = "同步费率",
          scope = "system", args = "" },
    }
}
```

`scope` 决定框架如何调用及传参:

| scope | 说明 | 传入参数结构 |
|-------|------|------------|
| `system`(默认) | 全局执行一次 | `CronSystemParams { args }` |
| `account` | 遍历该插件所有 **启用的通道账号**,各调用一次 | `types.CronAccountParams { account_info, account_options, plugin_option, args }` |
| `order` | 遍历该插件相关 **待支付订单**,各调用一次 | `CronOrderParams { order_info, account_info, account_options, plugin_option, args }` |

`options` 里可加 `disable_random = 1` 关闭随机延迟启动、`has_wait_pay_order = 1`(account scope)仅处理有待支付订单的账号。

对应的 Lua 方法返回一个 JSON 字符串 `{ err_code, err_message, data }`。

### 方式 B:`detection_interval` + `cron` 方法(逐账号巡检)

```lua
options = { detection_interval = 3, detection_type = "cron" }

---@param ctx types.CronAccountParams
function plugin.cron(ctx)
    local accountInfo = ctx.account_info
    local options = ctx.account_options
    -- ... 拉取第三方账单/回执,匹配后入库上报
    return json.encode({ err_code = 200, err_message = "扫描完成" })
end
```

典型用途:监听收款账号、轮询第三方到账。入账流程:

```lua
-- 1. 判断第三方订单是否已入库(去重)
local exist = orderPayHelper.third_order_exist({
    pay_type = accountInfo.pay_type, channel_code = accountInfo.code, uid = accountInfo.uid,
    account_id = accountInfo.id, third_account = options.account,
    third_order_id = record.transaction_id
})
-- 2. 未入库则插入
local insertId = orderPayHelper.third_order_insert({ ... , amount = record.amount, ... })
-- 3. 上报,触发订单匹配/回调商户
local code, msg = orderPayHelper.third_order_report(insertId)
```

账号上/下线控制:`helper.channel_account_online(id)` / `helper.channel_account_offline(id)`。

## 六、parseMessage(可选)— 短信/推送金额解析

配合 `plugins/common/message_parser.lua`。定义规则,从 App 通知/短信中用正则提取金额:

```lua
local message_parser = require("message_parser")

function plugin.parseMessage(msg)
    -- msg: types.PluginParseMessage { pay_type, channel_code, title, content, package_name }
    local rules = {
        ["com.eg.android.AlipayGphone"] = {
            { channel_code = "alipay", amount_in_title = false,
              content_reg = "成功收款(?<amount>[%d%.]+)元" },
        }
    }
    return message_parser.parse(msg, rules)
    -- 命中返回 { code=200, data={ amount, channel_code } }
end
```

## 七、金额约定

**框架内部金额统一以「分」为整数单位。** 常见转换:

```lua
local yuan = vOrderInfo.trade_amount / 100          -- 分 → 元
local fen  = math.floor((money + 0.000005) * 100)   -- 元 → 分(防浮点误差)
-- 或使用内置:
local fen  = helper.amount_str2int("10.50")         -- "10.50" → 1050
local yuan = helper.amount_int2str(1050)            -- 1050 → "10.50"
```

## 八、最小可运行骨架

```lua
---@diagnostic disable: undefined-global
package.path = package.path .. ";" .. luaCommonPath .. "/?.lua"
require("autoload")

local PLUGIN = "my_plugin"
local plugin = {}

function plugin.pluginInfo()
    return {
        channels = {
            ["alipay"] = { { label = '我的支付', value = 'alipay_my' } },
        },
        options = { callback = 1, detection_interval = 0 }
    }
end

function plugin.formItems(ctx)
    return {
        inputs = {
            { name = 'pid', label = '商户ID', type = types.InputTypes.INPUT, default = "",
              rules = { { required = true, trigger = { "input", "blur" }, message = "请输入" } } },
            { name = 'key', label = '密钥', type = types.InputTypes.PASSWORD, default = "",
              rules = { { required = true, trigger = { "input", "blur" }, message = "请输入" } } },
        }
    }
end

function plugin.create(ctx)
    local order = ctx.order_info
    local opt   = ctx.account_options

    local req = {
        pid = opt.pid,
        out_trade_no = order.order_id,
        name = order.subject,
        money = order.trade_amount / 100,
        notify_url = order.notify_url,
    }
    req.sign = plugin._sign(req, opt.key)

    local resp, err = http.request("POST", opt.host .. "/pay", {
        body = funcs.table_http_query(req),
        timeout = "30s",
        headers = { ["content-type"] = "application/x-www-form-urlencoded" }
    })
    if err ~= nil or not resp or not resp.body then
        return { code = 500, message = "请求失败:" .. tostring(err),
                 data = { type = types.PaymentResultTypes.ERROR } }
    end

    local r = json.decode(resp.body)
    if not r or tonumber(r.code) ~= 1 then
        return { code = 500, message = (r and r.msg) or "下单失败",
                 data = { type = types.PaymentResultTypes.ERROR } }
    end

    return {
        code = 200, message = "success",
        data = { type = types.PaymentResultTypes.JUMP, url = r.payurl, out_trade_no = r.trade_no }
    }
end

function plugin.notify(ctx)
    local req = ctx.request.method == "POST" and ctx.request.body or ctx.request.query
    if plugin._sign(req, ctx.account_options.key) ~= req.sign then
        return { code = 500, message = "验签失败", data = { response = "" } }
    end
    if req.trade_status ~= "TRADE_SUCCESS" and req.trade_status ~= "SUCCESS" then
        return { code = 500, message = "交易未完成", data = { response = "" } }
    end

    local code, msg, response = orderHelper.notify_process(
        json.encode({ out_trade_no = req.out_trade_no, trade_no = req.trade_no,
                      amount = math.floor((req.money + 0.000005) * 100) }),
        json.encode(ctx.params), json.encode(ctx.account_options))
    return { code = code, message = msg, data = { response = response } }
end

-- 私有:MD5 签名(按 key 字典序拼接 + 密钥)
function plugin._sign(param, key)
    local keys = {}
    for k in pairs(param) do table.insert(keys, k) end
    table.sort(keys)
    local s = ""
    for _, k in ipairs(keys) do
        local v = param[k]
        if k ~= "sign" and k ~= "sign_type" and v ~= '' then s = s .. k .. '=' .. v .. '&' end
    end
    return helper.md5(string.sub(s, 1, -2) .. key)
end

return plugin
```

配套 `manifest.json`:

```json
{ "name": "my_plugin", "title": "我的支付", "author": "you",
  "description": "示例支付插件", "link": "", "version": "1.0.0",
  "min_program_version": "1.5.0.8", "type": 1 }
```

## 九、可参考的官方插件

| 插件 | 亮点 |
|------|------|
| `plugins/pay/epay/` | 最典型:表单/签名/mapi&submit 两种下单/HTML 自动提交表单/回调 |
| `plugins/pay/alipay_pc/` | 借助 `orderPayHelper.alipay_pc_create/notify` 封装官方 SDK |
| `plugins/pay/wxpay_jsapi/` | JSAPI + `assets/` 静态资源 |
