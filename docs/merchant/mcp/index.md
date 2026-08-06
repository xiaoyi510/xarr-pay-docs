# MCP 接入指南

XArrPay 内置 MCP（Model Context Protocol）能力。开启后，你可以在支持 MCP 的 AI 客户端（如 Claude Desktop、Cursor 等）中，用自然语言安全地查询自己的订单、余额、交易统计、支付通道等数据。

::: tip 一句话理解
给你的 AI 助手一把「只读钥匙」，让它能替你查账，但绝不能动账。所有查询严格限定为你自己的数据，且全部为只读操作。
:::

## 功能特点

| 特性 | 说明 |
|------|------|
| 🔒 数据隔离 | 每把密钥只能访问其所属商户自己的数据，物理上无法越权 |
| 👀 纯只读 | 仅提供查询工具，不涉及任何代付、退款、修改等写操作 |
| 🔑 独立密钥 | 使用独立的 MCP 密钥鉴权，与登录密码、API 密钥互不影响 |
| 🛡 可吊销 | 密钥可随时禁用或删除，支持配置 IP 白名单与过期时间 |
| 📝 全程审计 | 每次调用（含鉴权失败）都会记录，便于安全追溯 |

## 第一步：开启 MCP 功能（管理员）

MCP 功能默认关闭，需要管理员在后台开启。

1. 登录后台管理系统
2. 进入 **系统设置 → 基础设置**
3. 切换到 **系统配置** 标签页
4. 打开 **MCP功能** 开关，点击 **保存配置**

::: warning 注意
只有开启该开关后，商户端才会出现「MCP密钥」入口，MCP 服务端点与密钥管理接口才会对外提供服务。关闭后所有相关调用立即失效。
:::

## 第二步：创建密钥（商户）

管理员开启功能后，商户即可自助管理密钥。

1. 登录商户中心（用户中心）
2. 在左侧菜单找到 **MCP密钥**，进入管理页
3. 点击 **创建密钥**，填写以下信息：

| 字段 | 必填 | 说明 |
|------|------|------|
| 备注名 | 是 | 便于识别的名称，如「Claude桌面端」 |
| IP白名单 | 否 | 多个 IP 用英文逗号分隔，留空表示不限制来源 IP |
| 过期时间 | 否 | 留空表示永久有效 |

4. 创建成功后会弹出 **密钥明文**

::: danger 密钥仅显示一次
密钥明文只在创建成功时展示这一次，关闭弹窗后将无法再次查看（系统只保存其哈希值）。请立即复制并妥善保存。如果遗失，只能删除后重新创建。
:::

密钥格式形如：

```
xarrpay_mcp_da56489ff47c8b2994e0cad41cdc748d42122592145efda5edfd894457580f06
```

## 第三步：连接 AI 客户端

MCP 服务端点为：

```
https://你的域名/api/mcp/merchant
```

调用时需在请求头携带密钥：

```
Authorization: Bearer 你的密钥
```

::::: tabs

== Claude Desktop / Cursor

这类客户端通过 `mcp-remote` 桥接远程服务。编辑客户端的 MCP 配置文件（Claude Desktop 为 `claude_desktop_config.json`），加入：

```json
{
  "mcpServers": {
    "xarrpay": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://你的域名/api/mcp/merchant",
        "--header",
        "Authorization: Bearer xarrpay_mcp_你的密钥"
      ]
    }
  }
}
```

保存后重启客户端，即可在对话中直接提问。

== 原生 Streamable HTTP

若客户端原生支持 Streamable HTTP 类型的 MCP Server，直接填写：

- **地址（URL）**：`https://你的域名/api/mcp/merchant`
- **请求头（Header）**：`Authorization: Bearer xarrpay_mcp_你的密钥`

== 命令行验证（curl）

用于快速验证密钥是否可用。注意必须携带 `Accept: application/json, text/event-stream` 请求头。

```bash
# 列出全部可用工具
curl -s -X POST https://你的域名/api/mcp/merchant \
  -H "Authorization: Bearer xarrpay_mcp_你的密钥" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 调用工具：查询账户余额
curl -s -X POST https://你的域名/api/mcp/merchant \
  -H "Authorization: Bearer xarrpay_mcp_你的密钥" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_balance","arguments":{}}}'
```

:::::

连接成功后，就可以用自然语言提问，例如：

- 「我的账户余额是多少？」
- 「最近有哪些订单？」
- 「这个月的成交统计怎么样？」
- 「帮我查一下订单号 20260805xxxx 的回调记录」

## 可用工具一览

当前提供 14 个只读查询工具，覆盖订单、资金、统计、渠道、账户五大类。AI 客户端会自动识别这些工具，你无需记忆工具名，用自然语言描述需求即可。

| 工具 | 说明 | 参数 |
|------|------|------|
| `get_balance` | 查询账户余额 | 无 |
| `get_profile` | 查询商户资料（密钥、手机号等敏感字段已脱敏） | 无 |
| `get_meal` | 查询套餐信息与到期时间 | 无 |
| `get_statistics` | 查询交易统计（成交额、订单数、成功率等） | 起止时间 |
| `get_daily_stats` | 查询按天成交趋势 | 起止时间 |
| `get_order` | 查询单笔订单详情 | 订单号 |
| `get_order_notify_log` | 查询某订单的回调通知记录 | 订单号 |
| `list_orders` | 查询订单列表（可按状态筛选、分页） | 状态、页码、每页条数 |
| `list_balance_logs` | 查询余额变动流水 | 页码、每页条数 |
| `list_withdraws` | 查询提现记录 | 页码、每页条数 |
| `list_rebate_logs` | 查询返佣记录 | 页码、每页条数 |
| `list_channels` | 查询已开通的支付通道及状态 | 无 |
| `list_pay_types` | 查询系统支持的支付方式 | 无 |
| `list_tickets` | 查询工单列表 | 页码、每页条数 |

::: tip 金额单位
所有金额字段的单位均为「分」。例如返回 `10000` 表示 100.00 元。
:::

## 安全说明

XArrPay 的 MCP 采用多层强制隔离，确保「零越权」：

- **身份唯一来源**：商户身份只从密钥解析得出，客户端在协议层没有任何传入他人身份的入口。
- **归属二次校验**：即便你知道他人的订单号，按订单号查询时也会强制校验归属，非本人订单一律拒绝。
- **仅商户能力**：MCP 服务实例只注册商户只读工具，物理上不存在任何管理员或全平台能力。
- **密钥可控**：支持 IP 白名单、禁用、过期时间；禁用或删除后，正在使用该密钥的客户端立即失效。
- **敏感脱敏**：商户密钥、完整手机号等敏感字段在返回前统一打码。

## 常见问题

**Q：商户端看不到「MCP密钥」入口？**
A：请确认管理员已在后台 **系统设置 → 基础设置 → 系统配置** 中开启 MCP 功能开关。

**Q：调用返回 `no server available` 或连接被拒？**
A：常见原因有三种，请逐一排查：密钥是否已禁用/过期/删除；来源 IP 是否在密钥的 IP 白名单内（若设置了白名单）；后台 MCP 全局开关是否仍处于开启状态。

**Q：密钥明文忘记保存了怎么办？**
A：出于安全考虑，系统只存储密钥哈希，无法找回明文。请删除旧密钥后重新创建一把。

**Q：MCP 能修改数据吗（如发起提现、修改配置）？**
A：不能。当前所有工具均为只读查询，不提供任何写操作，请放心使用。

**Q：一个商户可以创建多把密钥吗？**
A：可以。建议为不同的客户端或用途分别创建密钥，并配置各自的 IP 白名单，便于独立管理与吊销。



