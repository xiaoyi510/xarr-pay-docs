# 01 · 快速开始

## 1. 插件是什么

XArrPay 的插件是 **Lua 脚本**。每个插件是 `plugins/<类型>/<插件名>/` 下的一个目录,至少包含两个文件:

```
plugins/pay/epay/
├── manifest.json    # 插件元信息(名称、作者、版本、类型)
└── plugin.lua       # 插件逻辑,必须 return 一个 plugin 表
```

插件类型由所在目录决定:

| 目录 | manifest `type` | 说明 |
|------|-----------------|------|
| `plugins/pay/` | 1 | 支付插件 |
| `plugins/sms/` | 4 | 短信插件 |
| `plugins/pusher/` | — | 推送插件 |
| `plugins/certificate/` | — | 身份认证插件 |

> 支付、短信插件的 `manifest.json` 中 `type` 必须与目录类型匹配(支付=1,短信=4),否则插件无法加载。

## 2. manifest.json 字段

```json
{
  "name": "epay",                 // 插件唯一标识(须与目录名一致,英文小写)
  "title": "易支付",              // 后台显示名
  "author": "官方",              // 作者
  "description": "易支付通用SDK", // 描述
  "link": "",                     // 主页/文档链接
  "version": "1.5.0.8",           // 版本号
  "min_program_version": "1.5.0.8", // 最低程序版本
  "type": 1                       // 插件类型:支付=1,短信=4
}
```

启动时后台会校验它,并用其中的 `name/title/author/link/description/version/type` 作为插件的基础信息。**元信息以 manifest.json 为准**,`pluginInfo()` 只负责声明渠道、配置项、定时任务等运行时能力。

## 3. 执行模型(重要约定)

- 插件方法运行在一个 **进程池** 中:每次调用会分配一个独立的运行环境,执行完即回收。
- 因此插件方法应是 **无状态** 的:**不要依赖 Lua 全局变量在多次调用之间保存数据**(不同调用可能落在不同环境上)。
- 需要持久化的数据,请用配置读写函数(`helper.set_plugin_option` / `helper.set_option`)或框架订单接口保存,而不是存在内存变量里。

### 支付插件方法一览

| Lua 方法名 | 用途 |
|-----------|------|
| `pluginInfo` | 声明渠道 / 选项 / 定时任务 / 配置项(**必需**) |
| `formItems` | 声明通道账号配置表单(**必需**) |
| `create` | 创建订单 / 发起支付(**必需**) |
| `notify` | 异步回调处理(支持回调时必需) |
| `render` | 支付数据二次渲染(可选) |
| `cron` | 定时任务默认入口(可选) |
| `onAccountChanged` | 通道账号被编辑时触发(可选) |
| `login_qrcode` | 生成登录二维码(可选) |
| `login_qrcode_check` | 检查登录二维码状态(可选) |
| `heartbeat` | 心跳(可选) |
| `parseMessage` | 解析短信/推送消息提取金额(可选) |

另有两个生命周期事件(定义了就会被自动调用):`onStart`(插件启动后)、`onStop`(插件停止前)。

### 短信插件方法一览

| Lua 方法名 | 用途 |
|-----------|------|
| `pluginInfo` | 声明渠道与选项 |
| `formItems` | 配置表单 |
| `sendSms` | 发送短信 |
| `querySmsStatus` | 查询发送状态 |

## 4. 插件生命周期

```
启动
  ├─ 校验 manifest.json
  ├─ 载入 plugin.lua,注入内置函数
  └─ 启动完成:
       ├─ 调 pluginInfo() 读取渠道/配置项/定时任务
       ├─ 初始化配置项(写入配置,后台可改)
       ├─ 触发 onStart(若定义)
       └─ 注册 crontab_list 定时任务
运行中
  └─ 按需调用 create / notify / cron / ...
停止
  └─ 触发 onStop:移除定时任务、关闭相关连接
```

## 5. 插件文件头模板

`plugin.lua` 开头三行是固定模板,用于加载公共库和内置函数:

```lua
---@diagnostic disable: undefined-global
package.path = package.path .. ";" .. luaCommonPath .. "/?.lua"
require("autoload")   -- 一次性加载所有内置模块
```

执行后,`helper / http / json / funcs / types / orderPayHelper / orderHelper / log / crypto / ...` 全部可作为全局变量直接使用。

## 6. 一个插件的最小组成

```
plugins/pay/my_plugin/
├── manifest.json   # {"name":"my_plugin","title":"我的支付","type":1,"version":"1.0.0", ...}
└── plugin.lua      # 见 02 文档的最小骨架
```

> 下一步:阅读 [支付插件开发](./pay-dev.md)。
