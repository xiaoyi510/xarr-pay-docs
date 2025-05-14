## 订单助手

订单助手模块提供了订单管理和支付相关的功能函数，分为两个主要模块：`orderHelper` 和 `orderPayHelper`。

## orderHelper 模块
描述：订单基础操作助手，提供订单查询、通知处理等功能。

调用示例：

```lua
local orderHelper = require("orderHelper")
local code, data = orderHelper.get_out_pay_data("ORDER123456")
```

### orderHelper.get_out_pay_data
描述：获取订单外部支付数据

调用参数：
| 参数    | 参数类型 | 参数描述 |
| ------- | -------- | -------- |
| orderId | string   | 订单ID   |

返回值：
| 返回值 | 返回类型 | 返回描述                |
| ------ | -------- | ----------------------- |
| code   | number   | 状态码(200成功,404失败) |
| data   | string   | 订单外部数据            |

### orderHelper.notify_process
描述：处理异步通知

调用参数：
| 参数           | 参数类型 | 参数描述   |
| -------------- | -------- | ---------- |
| notifyData     | table    | 通知数据   |
| - out_trade_no | string   | 商户订单号 |
| - trade_no     | string   | 交易流水号 |
| - amount       | number   | 支付金额   |
| params         | table    | 额外参数   |
| options        | table    | 配置选项   |



返回值：
| 返回值      | 返回类型 | 返回描述                                  |
| ----------- | -------- | ----------------------------------------- |
| err_code    | number   | 状态码(200成功,404未找到订单,502处理失败) |
| err_message | string   | 错误信息                                  |
| response    | string   | 处理状态(success/fail)                    |

#### 调用案例

```lua
 -- 通知订单处理完成
        local err_code, err_message, response = orderHelper.notify_process(json.encode({
            out_trade_no = trade_no,
            trade_no = out_trade_no,
            amount = money,
        }), pParams, pluginOptions)

```



### orderHelper.reset_order_tmp_amount
描述：重置订单临时金额,用于需要重新设置汇率不同等情况导致的金额不一致问题

调用参数：
| 参数    | 参数类型 | 参数描述     |
| ------- | -------- | ------------ |
| orderId | string   | 订单ID       |
| start   | number   | 新的起始金额 |

返回值：
| 返回值  | 返回类型 | 返回描述   |
| ------- | -------- | ---------- |
| success | boolean  | 是否成功   |
| amount  | number   | 生成的金额 |

#### 调用案例
```lua
 -- 重置临时金额
    local res, newAmount = orderHelper.reset_order_tmp_amount(orderInfo.order_id, amount * 100)
    if res ==false then
        return json.encode({
            err_code = 500,
            err_message = "重置临时金额失败"
        })
    end
```

### orderHelper.report
描述：推送订单通知消息

调用参数：
| 参数                 | 参数类型 | 参数描述                     |
| -------------------- | -------- | ---------------------------- |
| accountInfo          | table    | 渠道账号信息                 |
| - id                 | int      | 通道账号ID                   |
| - uid                | int      | 所属用户ID                   |
| params               | table    | 通知参数                     |
| - amount             | int      | 支付金额                     |
| - pay_type           | string   | 支付类型(qqpay/alipay/wxpay) |
| - channel_code       | string   | 支付方式                     |
| - remark             | string   | 备注信息                     |
| - pay_time           | string   | 支付时间                     |
| - coll_user          | string   | 收款账号                     |
| - pay_user           | string   | 付款账号                     |
| - uid                | string   | 用户ID                       |
| - order_id           | string   | 订单ID                       |
| - out_order_id       | string   | 外部订单号                   |
| - channel_account_id | int      | 渠道账号ID                   |
| - timestamp          | string   | 时间戳                       |

返回值：
| 返回值  | 返回类型 | 返回描述 |
| ------- | -------- | -------- |
| success | boolean  | 是否成功 |

## orderPayHelper 模块
描述：订单支付助手，提供第三方订单管理和各支付渠道接口。

调用示例：

```lua
local orderPayHelper = require("orderPayHelper")
local exists = orderPayHelper.third_order_exist({third_id = "123456"})
```

### orderPayHelper.third_order_exist
描述：检查第三方订单是否存在

调用参数：
| 参数             | 参数类型 | 参数描述     |
| ---------------- | -------- | ------------ |
| params           | table    | 查询参数     |
| - uid            | int      | 用户ID       |
| - account_id     | int      | 账号ID       |
| - third_order_id | string   | 第三方订单ID |
| - pay_type       | string   | 支付类型     |
| - channel_code   | string   | 支付渠道代码 |
| - third_account  | string   | 第三方账号   |

返回值：
| 返回值 | 返回类型 | 返回描述     |
| ------ | -------- | ------------ |
| exists | boolean  | 订单是否存在 |

### orderPayHelper.third_order_insert
描述：插入第三方订单
调用参数：
| 参数             | 参数类型 | 参数描述     |
| ---------------- | -------- | ------------ |
| params           | table    | 订单数据     |
| - pay_type       | string   | 支付类型     |
| - channel_code   | string   | 支付渠道代码 |
| - uid            | int      | 用户ID       |
| - account_id     | int      | 账号ID       |
| - third_account  | string   | 第三方账号   |
| - buyer_id       | string   | 买家ID       |
| - buyer_name     | string   | 买家名称     |
| - out_order_id   | string   | 外部订单号   |
| - third_order_id | string   | 第三方订单号 |
| - amount         | int      | 支付金额     |
| - remark         | string   | 备注信息     |
| - trans_time     | int      | 交易时间     |
| - type           | string   | 订单类型     |

返回值：
| 返回值 | 返回类型 | 返回描述     |
| ------ | -------- | ------------ |
| id     | number   | 插入的订单ID |

### orderPayHelper.third_order_report
描述：上报第三方订单

调用参数：
| 参数 | 参数类型 | 参数描述 |
| ---- | -------- | -------- |
| id   | number   | 订单ID   |

返回值：
| 返回值  | 返回类型 | 返回描述                |
| ------- | -------- | ----------------------- |
| code    | number   | 状态码(200成功,500失败) |
| message | string   | 处理结果消息            |

### orderPayHelper.get_toapp_url
描述：获取toapp URL

调用参数：
| 参数    | 参数类型 | 参数描述 |
| ------- | -------- | -------- |
| orderId | string   | 订单ID   |
| host    | string   | 主机地址 |

返回值：
| 返回值 | 返回类型 | 返回描述        |
| ------ | -------- | --------------- |
| url    | string   | 完整的toapp URL |

### orderPayHelper.jdsyt_check
描述：京东收银台订单检查

调用参数：
| 参数           | 参数类型 | 参数描述               |
| -------------- | -------- | ---------------------- |
| checkOrderInfo | string   | 订单检查信息(JSON格式) |
| pluginOptions  | string   | 插件配置选项(JSON格式) |

返回值：
| 返回值  | 返回类型 | 返回描述                |
| ------- | -------- | ----------------------- |
| code    | number   | 状态码(200成功,500失败) |
| message | string   | 处理结果消息            |

说明：
- 检查订单支付状态
- 支持订单金额校验
- 支持订单支付完成处理
- 支持订单异常处理(如金额不匹配等)

### orderPayHelper.alipay_bill_list
描述：获取支付宝账单列表

调用参数：根据具体实现确定

返回值：根据具体实现确定



### 支付宝系列接口
描述：支付宝各场景支付接口，包括wap、pc、dmf、prepay等

#### orderPayHelper.alipay_wap_create / orderPayHelper.alipay_pc_create / orderPayHelper.alipay_dmf_create / orderPayHelper.alipay_prepay_create
描述：创建支付宝订单（分别对应手机网页支付、电脑网页支付、当面付、预支付）

#### orderPayHelper.alipay_wap_notify / orderPayHelper.alipay_pc_notify / orderPayHelper.alipay_dmf_notify / orderPayHelper.alipay_prepay_notify
描述：处理支付宝订单通知（分别对应手机网页支付、电脑网页支付、当面付、预支付）

### 微信支付系列接口
描述：微信支付各场景接口，包括native_v3和jsapi等

#### orderPayHelper.wxpay_native_v3_create / orderPayHelper.wxpay_jsapi_create
描述：创建微信支付订单（分别对应原生支付V3和JSAPI支付）

#### orderPayHelper.wxpay_native_v3_notify / orderPayHelper.wxpay_jsapi_notify
描述：处理微信支付订单通知（分别对应原生支付V3和JSAPI支付）

