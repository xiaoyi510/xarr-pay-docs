# 03 · 内置函数参考(速查)

插件里所有可直接调用的模块分两类:

1. **公共库(Lua)**:`plugins/common/` 下的纯 Lua 文件,`require("autoload")` 后即为全局。
2. **框架内置模块**:由框架在插件运行环境中提供,如 `helper`、`http`、`orderPayHelper`、`orderHelper`、`crypto`、`log`、`template`、`websocket`、`url`、`xmlpath`。

> 类型提示(`---@type`)统一定义在 `plugins/common/types.lua`,IDE 装 Lua LSP 后有补全。

---

## 一、模块加载

```lua
require("autoload")           -- 推荐:一行注入所有全局模块
-- 或按需:
local common = require("init")
local log, json, helper = common.u("log", "json", "helper")
```

`common` 预设组合:`standard()`=log/json/helper/orderPayHelper/types;`basic()`=log/json/helper/response;`payment()`=json/helper/orderPayHelper/http/log/response;`full()`=常用全集。

全局模块清单:`funcs types http url log json xml response helper template orderPayHelper orderHelper message_parser websocket crypto xmlpath`。

---

## 二、helper — 核心工具

helper 是最常用的内置工具模块,提供编码、时间、金额、签名、正则、配置读写、账号操作等能力。

### 编码 / 解码

| 函数 | 说明 |
|------|------|
| `helper.base64_encode(s)` / `helper.base64_decode(s)` | Base64 编解码 |
| `helper.url_encode(s)` / `helper.url_decode(s)` | URL 编解码 |
| `helper.path_encode(s)` / `helper.path_decode(s)` | 路径编解码 |
| `helper.gbk_to_utf8(s)` / `helper.utf8_to_gbk(s)` | GBK ↔ UTF-8 |
| `helper.xml_to_json(xml)` | XML 转 JSON 字符串 |
| `helper.url_parse(url)` | 解析 URL,返回表(含 scheme/host/path/query/query_str 等) |

### 随机 / 时间

| 函数 | 说明 |
|------|------|
| `helper.str_random(n)` | 随机字符串(字母数字) |
| `helper.number_random(n)` | 随机数字串 |
| `helper.abc_random(n)` | 随机字母串 |
| `helper.random_string(n)` | 随机字符串(阿里云短信 SignatureNonce 使用) |
| `helper.time_now_timestamp()` | 当前时间戳(秒) |
| `helper.time_now_small_time()` | `20091227091010` 格式 |
| `helper.time_now_ymd_time()` | `20091227` 格式 |
| `helper.time_now_datetime()` | `2006-01-02 15:04:05` 格式 |
| `helper.time_now_date()` / `helper.date()` | 日期/日期时间 |
| `helper.time_now_iso()` | ISO 时间 |
| `helper.datetime_to_timestamp(dt)` | 日期时间 → 时间戳 |

### 金额

| 函数 | 说明 |
|------|------|
| `helper.amount_str2int("10.50")` | 元字符串 → 分(1050) |
| `helper.amount_int2str(1050)` | 分 → 元字符串("10.50") |

### 哈希 / 签名 / 加密

| 函数 | 说明 |
|------|------|
| `helper.md5(s)` | MD5 |
| `helper.hmac_sha1_base64(data, key)` | HMAC-SHA1 → Base64(阿里云短信用) |
| `helper.hmac_sha256_base64(data, key)` / `helper.hmac_sha256_hex(data, key)` | HMAC-SHA256 |
| `helper.rsa_private_sign_base64(content, privKey)` | RSA 私钥签名 → Base64 |
| `helper.rsa_public_verify_sign_base64(content, sign, pubKey)` | RSA 验签 |
| `helper.rsa_gen_key_pair()` | 生成 RSA 密钥对 |
| `helper.rsa_private_encrypt / rsa_public_decrypt / rsa_public_encrypt / rsa_private_decrypt` | RSA 加解密(见 types.lua) |

> 常量:`RSA`、`RSA2`、`SM2` 作为签名算法标识由 helper 暴露。

### 正则

| 函数 | 说明 |
|------|------|
| `helper.regexp_match(s, pattern)` | 是否匹配 → boolean |
| `helper.regexp_match_group(s, pattern)` | 匹配 + 命名分组;返回 `matched, groups`(`groups['name']` 为数组) |

### 二维码 / 图片

| 函数 | 说明 |
|------|------|
| `helper.decode_qrcode_from_url(url)` | 从图片 URL 解析二维码内容,返回 `text, err` |
| `helper.save_image_cache_base64(b64)` | 保存 Base64 图片到缓存,返回可访问路径 |

### 配置读写

| 函数 | 说明 |
|------|------|
| `helper.get_plugin_option(pluginName, key, default?)` | 读插件配置 |
| `helper.set_plugin_option(pluginName, key, value)` | 写插件配置 |
| `helper.get_option(key)` | 读系统配置 |
| `helper.set_option(key, value)` | 写系统配置 |
| `helper.system_open_id()` | 当前授权 open_id |

### 通道账号操作

| 函数 | 说明 |
|------|------|
| `helper.channel_account_online(id)` / `helper.channel_account_offline(id)` | 账号上/下线 |
| `helper.channel_account_enable(id)` / `helper.channel_account_disable(id)` | 启用/停用 |
| `helper.channel_account_create(...)` / `helper.channel_account_update(...)` | 创建/更新账号 |
| `helper.channel_account_set_option(...)` / `helper.channel_account_empty_option(...)` | 设置/清空账号配置 |
| `helper.channel_gateway_addr(...)` | 通道网关地址 |

### 代理

`helper.proxy_pool_fetch(...)` / `helper.proxy_pool_release(...)` 取用/释放代理;`helper.proxy_url / proxy_address / proxy_port / proxy_type / proxy_username / proxy_password / proxy_id` 读取当前代理属性。

### HTTP(helper 版)

`helper.http_request(...)` — 底层 HTTP(通常用下面的 `http` 模块更方便)。

---

## 三、http — HTTP 请求

```lua
---@return types.HttpResponse response, string|nil error
local resp, err = http.request("POST", url, {
    query   = "a=1&b=2",   -- 查询串(可选)
    body    = "raw body",  -- 请求体(可选)
    form    = "",          -- 表单(可选)
    timeout = "30s",       -- 超时
    headers = { ["content-type"] = "application/json" },
})
-- resp: { status_code = 200, body = "...", headers = {...} }
if err ~= nil then ... end
```

也有 `http.get(url, params?)` / `http.post(url, params?)`(见 types)。**务必判空 `err` 与 `resp`/`resp.body` 再使用。**

---

## 四、json / xml / xmlpath / url

```lua
json.encode(tbl)   -- Lua 表 → JSON 字符串
json.decode(str)   -- JSON 字符串 → Lua 表(失败返回 nil,需判空)

xml.newParser()    -- 见 plugins/common/xml.lua: :ToXmlString / :FromXmlString / :ParseXmlText
xmlpath.parse(xml) ; xmlpath.select(doc, "//path")  -- XPath 查询

url.parse(u) ; url.build(t) ; url.encode(s) ; url.decode(s)
```

---

## 五、crypto — 加密

`crypto.md5(s)`、`crypto.sha1(s)`、`crypto.sha256(s)`、`crypto.hmac_sha1(s, key)`、`crypto.hmac_sha256(s, key)`。

---

## 六、log — 日志

`log.info(...)`、`log.debug(...)`、`log.warning(...)`、`log.error(...)`。也可用 Lua 原生 `print(...)`(会进插件日志)。

---

## 七、orderPayHelper — 支付/订单辅助

订单相关的辅助函数。核心成员:

| 函数 | 说明 |
|------|------|
| `orderPayHelper.third_order_exist(params)` | 第三方订单是否已入库(去重),返回 boolean |
| `orderPayHelper.third_order_insert(params)` | 插入第三方订单,返回 insertId |
| `orderPayHelper.third_order_report(orderId)` | 上报第三方订单(触发匹配/回调),返回 `code, msg` |
| `orderPayHelper.get_out_pay_data(...)` | 获取外部支付数据 |
| `orderPayHelper.get_pay_url(orderId, host)` | 生成平台支付页 URL |
| `orderPayHelper.get_toapp_url(orderId, host)` | 生成移动端跳转 URL |
| `orderPayHelper.report(...)` | 通用上报 |
| `orderPayHelper.alipay_pc_create / alipay_pc_notify` | 支付宝 PC 下单/回调 |
| `orderPayHelper.alipay_wap_create / alipay_wap_notify` | 支付宝 WAP |
| `orderPayHelper.alipay_dmf_create / alipay_dmf_notify` | 支付宝当面付 |
| `orderPayHelper.alipay_prepay_create / alipay_prepay_notify` | 支付宝预授权 |
| `orderPayHelper.wxpay_jsapi_create / wxpay_jsapi_notify` | 微信 JSAPI |
| `orderPayHelper.wxpay_native_v3_create / wxpay_native_v3_notify` | 微信 Native V3 |
| `orderPayHelper.alipay_bill_list(state)` | 支付宝账单列表 |
| `orderPayHelper.jdsyt_check(state)` | 京东收银台检查 |

> `官方 SDK 类` 渠道(支付宝/微信)建议直接复用上面的 `xxx_create/xxx_notify`,插件里只做参数组织,签名/加密交给框架。参数结构参考 `plugins/pay/alipay_pc/`、`plugins/pay/wxpay_jsapi/`。

### 递增金额

`orderHelper.reset_order_tmp_amount(orderId, fen)` — 重置订单临时金额(递增金额类渠道按费率折算后使用),返回 `ok, newAmount`。

---

## 八、orderHelper — 订单回调

```lua
-- 完成一笔支付订单;三个入参均为 JSON 字符串
local code, msg, response = orderHelper.notify_process(
    json.encode({ out_trade_no = "...", trade_no = "...", amount = 1000 }), -- amount 单位:分
    json.encode(params),           -- 原始回调参数
    json.encode(account_options))  -- 通道账号配置
-- code=200 处理成功;response 为应答第三方的字符串(如 "success")
```

---

## 九、template / websocket

```lua
template.render(tpl, data)          -- 渲染模板字符串
websocket.send(conn_id, message)    -- 定向发送
websocket.broadcast(message)        -- 广播
```

---

## 十、funcs — 纯 Lua 小工具(`plugins/common/funcs.lua`)

| 函数 | 说明 |
|------|------|
| `funcs.table_http_query(tbl)` | 表 → `k=v&k2=v2` 查询串 |
| `funcs.table_to_xml_string(version, charset, tbl)` | 表 → `<xml ...>...</xml>` |
| `funcs.encode_url(s)` | URL 编码(空格转 `+`) |
| `funcs.count(tbl)` | 统计表元素个数 |

---

## 十一、response — 统一响应(`plugins/common/response.lua`)

```lua
response.success(data, message?, code?)  -- { code=200, message="success", data=data }
response.error(message, code?, data?)    -- { code=500, message=message, data={} }
```

---

## 十二、message_parser — 消息解析(`plugins/common/message_parser.lua`)

```lua
message_parser.parse(msg, rules)
-- msg:   types.PluginParseMessage { package_name, channel_code, title, content }
-- rules: { [package_name] = { { channel_code, amount_in_title, title_reg, content_reg } , ... } }
-- content_reg / title_reg 用命名分组 (?<amount>...) 提取金额
-- 命中: { code=200, data={ amount, channel_code } };未命中: { code=500 }
```
