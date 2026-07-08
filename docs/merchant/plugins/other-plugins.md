# 04 · 短信 / 推送 / 身份认证插件

除支付插件外,系统还有三类插件。它们与支付插件共用运行环境和内置函数,但接口不同。

---

## 一、短信插件(SMS)

- **目录**:`plugins/sms/<插件名>/`,含 `plugin.lua` + `manifest.json`(`type` 必须为 **4**)。
- **官方实现**:`aliyun`(阿里云)、`tencent`(腾讯云)、`smsbao`(短信宝)、`upyun`(又拍云)。
- **标准方法**:

| Lua 方法 | 用途 |
|---------|------|
| `pluginInfo()` | 声明渠道 + 选项(**必需**) |
| `formItems(ctx)` | 配置表单(**必需**) |
| `sendSms(ctx)` | 发送短信(**必需**) |
| `querySmsStatus(ctx)` | 查询发送状态(可选) |

### pluginInfo()

短信插件的 `pluginInfo` 既可用函数返回,也可像官方 aliyun 那样直接挂 `plugin.info` 表再由 `pluginInfo()` 返回。渠道 key 为 `sms`,渠道项用 `sms_types` 声明支持的短信类型:

```lua
local plugin = {
    info = {
        channels = {
            sms = { {
                label = "默认短信渠道", value = "default", info = "默认短信发送通道",
                sms_types = {
                    types.SmsTypes.VERIFY_CODE,   -- verify_code 验证码
                    types.SmsTypes.NOTIFICATION,  -- notification 通知
                    types.SmsTypes.MARKETING,     -- marketing 营销
                }
            } }
        },
        options = { status_query = 1, balance_query = 1 },
        gateway = "https://dysmsapi.aliyuncs.com"
    }
}
function plugin.pluginInfo() return plugin.info end
```

### sendSms(ctx)

```lua
---@param ctx { sms_info: table, plugin_options: table }
function plugin.sendSms(ctx)
    local smsInfo = ctx.sms_info          -- { phone, template_params, ... }
    local options = ctx.plugin_options    -- formItems 填写的配置(access_key 等)

    if type(smsInfo) ~= "table" then return response.error("sms_info 必须为 table", 400) end
    if not smsInfo.phone or not smsInfo.template_params then
        return response.error("缺少必需参数:手机号或模板参数", 400)
    end
    -- ... 组装请求、签名、发送 ...
    return response.success({ message_id = "...", request_id = "..." }, "短信发送成功")
end
```

**入参约定**:`ctx.sms_info` 含 `phone`(手机号)、`template_params`(模板参数表,验证码常见键 `code`/`min`);`ctx.plugin_options` 为通道配置。返回统一用 `response.success/error`。

### querySmsStatus(ctx)

```lua
---@param ctx { query_info: table, plugin_options: table }
function plugin.querySmsStatus(ctx)
    local q = ctx.query_info   -- { phone, send_date, biz_id, page_size?, current_page? }
    -- ... 查询 ...
    return response.success({ details = ..., total_count = ... }, "查询成功")
end
```

> 完整实现参考 `plugins/sms/aliyun/plugin.lua`(含 HMAC-SHA1 签名 `helper.hmac_sha1_base64`、RFC3986 percent-encode、验证码/通知两套服务类型切换、手机号脱敏日志等),是短信插件的最佳范本。

---

## 二、推送插件(Pusher)

- **目录**:`plugins/pusher/<插件名>/`。元信息文件为 `plugin.json5`(带注释的 JSON,字段:`name/title/author/logo/description/link/version/min_version`),部分插件把 info 直接写在 `plugin.lua` 里。
- **官方实现**:`wxpusher`(WxPusher)、`gotify`(Gotify 自建)、`websocket_demo`(WebSocket 示例)。
- 推送插件接口 **尚未完全统一**,不同插件方法集不同。以下为现有约定,开发时以参考实现为准。

### wxpusher 风格(消息推送)

```lua
plugin = {
    info = { name="wxpusher", title="WxPusher通知", author="System",
             description="...", link="...", version="1.0.1" },
    config = { source = "wxpusher" }  -- 从用户哪个关联字段读取绑定信息
}

function plugin.pluginInfo() return plugin.info end

function plugin.formItems()
    -- 注意:wxpusher 返回的是 json.encode 后的字符串
    return json.encode({ inputs = {
        { name='app_token', label='App Token', type='input', required=true, default="" },
        { name='uid',       label='用户UID',  type='input', required=true, default="" },
        { name='content_type', label='默认消息格式', type='select', default="1",
          options = { {label='文本',value='1'}, {label='HTML',value='2'}, {label='Markdown',value='3'} } },
    } })
end

-- 发送通知:receivers 接收者列表,title 摘要,content 正文,options 覆盖项
function plugin.push(receivers, title, content, options)
    local config = plugin.getConfig()
    -- ... http.post 到 WxPusher,带重试 ...
    return true, result   -- 成功返回 true+结果;失败返回 false+错误信息
end

function plugin.test(config) ... end            -- 测试推送
function plugin.validateConfig(config) ... end  -- 校验配置
```

### gotify 风格(用户绑定型)

```lua
plugin = {}

-- formType: "user"=用户设置 / 其他=管理员设置(返回 nil 表示无需设置)
function plugin.formItems(formType)
    if formType == "user" then
        return {
            { name="host",  type="input", placeholder="Gotify Url 如 https://xx.com", options={ trim=1 } },
            { name="token", type="input", placeholder="Gotify Token", options={ trim=1 } },
        }
    end
    return nil
end

function plugin.getBindInfo(userInfo)      -- 返回绑定方式 { type="form|link|qrcode", data="" }
    return { type = "form", data = "" }
end
function plugin.onBindSubmit() end                       -- 提交绑定
function plugin.pushMessage(userConnectInfo, message) end -- 推送消息
```

> 推送插件可用 `websocket.send/broadcast` 做站内实时推送(见 `websocket_demo`)。

---

## 三、身份认证插件(Certificate)

- **目录**:`plugins/certificate/<插件名>/`,目前仅 `alipay_face`(支付宝刷脸认证,占位实现)。
- 该类插件用于身份认证/实名核验流程,接口随业务定制,暂无统一规范。开发时以实际业务需求和官方后续实现为准。

---

## 四、三类插件对比

| 维度 | 支付 pay | 短信 sms | 推送 pusher | 身份认证 certificate |
|------|---------|----------|------------|-----------------|
| 目录 | plugins/pay | plugins/sms | plugins/pusher | plugins/certificate |
| 元信息 | manifest.json (type=1) | manifest.json (type=4) | plugin.json5 / 内联 | 内联 |
| manifest 强校验 | ✅ | ✅ | ❌ | ❌ |
| 核心方法 | create/notify | sendSms | push/pushMessage | 定制 |
| 接口稳定度 | 稳定 | 稳定 | 演进中 | 演进中 |

新增短信插件推荐直接复制 `plugins/sms/aliyun/` 改造。
