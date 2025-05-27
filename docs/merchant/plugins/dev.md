# 插件开发

插件功能使用Lua语言开发的,如果需要学习开发 可直接看项目自带的插件进行二开

目前暂时数据交互使用json格式


## 支付插件结构


### 插件入口

```lua
-- 插件入口 功能类似:类
plugin = {
    -- 插件信息
    info = {
        -- 插件名称
        name = 'demo',
        -- 插件标题
        title = '测试插件',
        -- 插件作者
        author = '包子',
        -- 插件描述
        description = "监控插件",
        -- 插件作者地址
        link = 'https://blog.52nyg.com',
        -- 插件版本
        version = "1.0.1",
        -- 支持支付通道
        channels = {
            -- 支付类型可选项: alipay wxpay qqpay bank 等 (或用户自定义支付类型) 
            -- 此为数组类型
            bank = {
                 {
                    -- 支付通道名称
                    label = '测试插件',
                    -- 提供的通道名称 需要系统中唯一
                    value = 'demo',
                    -- 绑定支付方式,如果传入 则当前类型下可选项有以下,否则只为当前配置的支付通道
                    bind_pay_type = { "alipay", "wxpay", "bank" },

                    -- 支持接口上报
                    report = 1,
                    -- 支持插件解析上报内容
                    parse_msg = 1,
                    -- 通道选项
                    options = {
                        -- 使用第三方子账号模式,根据第三方主动上报到平台来进行匹配子账号规则
                        use_sub_account = 1,
                        -- 子账号提示名称
                        sub_account_label = "账号",
                        sub_account_placeholder = "请勿过使用于复杂的名字 如:火星文,Emoji等特殊符号",

                        -- 使用递增金额规则
                        use_add_amount = 1,
                        -- 使用二维码登录流程
                        use_qrcode_login = 1,

                          -- 增加自定义按钮
                        actions = {
                            {
                                label = "唤醒",
                                func = "action_wake", -- 为空则无操作
                                type = "confirm", -- 操作类型 click:点击触发 confirm: 弹出是否确认 prompt: 输入内容 form: 弹出输入框
                                -- form_items = {}, -- 是否需要输入内容格式跟formItems一致 待实现
                                options = {
                                    tip = "是否需要唤醒", -- 如果为 confirm,prompt 就弹出此内容为提示
                                }
                            }
                        }
                    }
                },
            },
        },
        options = {
            -- 插件提供回调模式
            callback = 1,
            ----------------------------定时根据订单号来执行任务 Start
            -- 插件定时检查时间 单位秒 为0 不处理
            detection_interval = 0,
            --- cron 定时执行任务 order 单订单检查(预留 暂时无效)
            detection_type = "cron", 
            ----------------------------定时根据订单号来执行任务 End

            -- 定时任务,此方法为系统级别的定时任务,不跟订单号挂钩
            crontab_list = {
               {
                crontab = "*/15 * * * * *",  -- 定时任务结构 "秒 分 时 日 月 周" 例如每分钟执行: "0 * * * * *"
                fun = "check_account", -- 具体func名称
                args = "", -- 执行时传入对应的func
                name = "拉卡拉检查账号状态", -- 本插件内唯一
                scope = "account" -- 目标范围 order 订单(只查询订单未支付状态) account 账号 (只查询账号在线状态) system 全局
              },
            },
            -- 配置项,插件提供什么全局的配置项,可选 不需要时请勿传入
            options = {
                {
                    title = "费率", key = "rate", default = "0.15521"
                },
            }
        },

    }
}
```


### pluginInfo 返回插件信息

```lua
-- 用于返回当前插件的信息 
function plugin.pluginInfo()
    return json.encode(plugin.info)
end
```



### formItems 返回支付通道Form表单配置项
```lua
-- 获取支付通道内的form表单内容
function plugin.formItems(payType, payChannel)
    return json.encode({
        inputs = {
            {
                -- form表单name
                name = 'app_id',
                -- form表单Label标签内容
                label = '设备ID',
                -- form表单类型
                type = 'input',
                -- 是否隐藏表单
                hidden = 1 ,
                -- 在支付通道列表页面配置数据列是否显示此字段
                hidden_list = 1,
                -- 默认值
                default = "",
                -- 提示
                placeholder = "请填写AppID",
                -- 显示条件 js代码
                when = "",
                -- 待选项 radio select 等使用
                values = {
                    {label:"",value:""}
                },
                -- 配置项
                options = {
                    -- 增加解析二维码功能
                    append_deqrocde = 1,
                    -- form对象下方的提示内容
                    tip = '',
                },
                -- 输入规则 参考ElementUI From Rules
                rules = {
                    {
                        required = true,
                        trigger = { "input", "blur" },
                        message = "请输入",
                    }
                }
            },
        },
    })
end
```


### create 创建订单
```lua
-- 订单创建使用此接口 pOrderInfo: 订单信息 pluginOptions: 用户配置的支付通道信息 内容格式为json
function plugin.create(pOrderInfo, pluginOptions, ...)
    return json.encode({
            -- 返回支付类型 可选项:pre(需要预处理 如需要微信先登录获取openId等) html(渲染html) qrcode(显示二维码) jump(跳转)
            type = "html",
            -- 返回二维码内容
            qrcode = "",
            -- jump 的url地址
            url = "",
            -- html content
            content = content,
            -- 返回错误码 200 为正确
            err_code = 200,
            -- 返回错误信息
            err_message = ""
        })
end
```

### notify 支付异步回调

```lua

-- 支付回调
function plugin.notify(request, orderInfo, params, pluginOptions)
    -- 失败返回
    return json.encode({
            error_code = 500,
            error_message = "签名校验失败"
        })
    -- 成功返回
    return json.encode({
        error_code = 200,
        error_message = "支付成功",
        response = "我是支付响应结果,用于输出给调用方,不填写则默认success",
    })

end
```


### parseMsg 解析上报内容

#### pMsg 结构
``` js
pMsg ={
// 支付类型
pay_type :"alipay",
// 支付插件的通道代码
channel_code :"",
// 上报标题
title :"",
// 上报内容
content :"",
// 上报包名
package_name :""
}
```

```lua
function plugin.parseMsg(pMsg)
    -- 匹配到金额,返回成功和具体金额
  return json.encode({
        err_code = 200,
        amount = "1.5",
    })
    -- 返回失败
    return json.encode({
        err_code = 500,
        err_message = "未能匹配"
    })
end
```


### 支付数据渲染

#### 参数说明

`render`函数用于根据不同设备环境动态渲染支付数据，每次用户渲染二维码时都会重新请求此函数。如果不实现此函数，系统将使用默认渲染方式。

- `pOrderInfo`: 订单信息
- `pOldPayData`: 原始支付数据
- `pAccountInfo`: 账户信息
- `pDeviceInfo`: 设备信息，包含设备类型标识

#### 案例
```lua

-- 支付数据渲染
function plugin.render(pOrderInfo,pOldPayData,pAccountInfo,pDeviceInfo)
    log.debug("渲染测试数据",pOrderInfo,pOldPayData,pAccountInfo,pDeviceInfo)
    local vDeviceInfo = json.decode(pDeviceInfo)
    local vOldPayData = json.decode(pOldPayData)

    -- 如果是微信
    if vDeviceInfo.is_wechat then
        return json.encode({
            error_code = 200,
            error_message = "success",
            action = "render", -- 为空不需要渲染 save 保存渲染数据 render 只渲染 不保存
            data = {
                type = "text",
                content = "我在微信里面"
            },  -- 返回的payData
        })
    end

    -- 如果是qq
    if vDeviceInfo.is_qq then
        return json.encode({
            error_code = 200,
            error_message = "success",
            action = "render", -- 为空不需要渲染 save 保存渲染数据 render 只渲染 不保存
            data = {
                type = "text",
                content = "我在QQ里面"
            },  -- 返回的payData
        })
    end

    -- 如果是支付宝
    if vDeviceInfo.is_alipay then
        return json.encode({
            error_code = 200,
            error_message = "success",
            action = "render", -- 为空不需要渲染 save 保存渲染数据 render 只渲染 不保存
            data = {
                type = "jump",
                url= vOldPayData.qrcode
            },  -- 返回的payData
        })
    end
    -- 如果是浏览器
    if vDeviceInfo.is_browser then
        return json.encode({
            error_code = 200,
            error_message = "success",
            action = "render", -- 为空不需要渲染 save 保存渲染数据 render 只渲染 不保存
            data = {
                type = "text",
                content = "我在l浏览器里面"
            },  -- 返回的payData
        })
    end

    -- 如果是PC
    if vDeviceInfo.is_pc then
        return json.encode({
            error_code = 200,
            error_message = "success",
            action = "render", -- 为空不需要渲染 save 保存渲染数据 render 只渲染 不保存
            data = {
                type = "text",
                content = "我是PC"
            },  -- 返回的payData
        })
    end


    if vDeviceInfo.is_mobile then
        return json.encode({
            error_code = 200,
            error_message = "success",
            action = "render", -- 为空不需要渲染 save 保存渲染数据 render 只渲染 不保存
            data = {
                type = "text",
                content = "我是手机"
            },  -- 返回的payData
        })
    end


    return json.encode({
        error_code = 200,
        error_message = "success",
        action = "", -- 为空不需要渲染 save 保存渲染数据 render 只渲染 不保存
        data = pOldPayData,  -- 返回的payData
    })
end
```

#### 返回说明

   - 根据不同设备类型（浏览器、PC、移动设备）返回不同内容
   - `action` 字段说明：
     - 空值：不需要渲染,按照 `create` 方法返回的数据处理
     - `save`：保存渲染数据
     - `render`：只渲染不保存
   - `data` 字段包含具体返回内容 格式等同`create`方法返回的内容



### 生成登录二维码

```lua
-- 二维码登录
function plugin.login_qrcode(pAccountInfo, pUserInfo, pParams)
    local vParams = json.decode(pParams)
    local vAccountInfo = json.decode(pAccountInfo)
    local vAccountOption = json.decode(vAccountInfo.options)
    local vUserInfo = json.decode(pUserInfo)

    -- 获取服务端地址
    local serverAddress = helper.channel_gateway_addr(vAccountOption.gateway)
    if serverAddress == "" then
        return json.encode({
            err_code = 500,
            err_message = "暂未配置支付网关"
        })
    end

    ---- 省略过程

    return json.encode({
        -- 返回二维码
        qrcode = qrcode,
        -- 返回二维码相关参数 check 会一并携带返回
        options = {
            client_id = client_id
        },
        err_code = 200,
        err_message = ""
    })

end
```


```lua


-- 检查二维码登录状态
function plugin.login_qrcode_check(pAccountInfo, pUserInfo, pParams)
    local vParams = json.decode(pParams)
    local vAccountInfo = json.decode(pAccountInfo)
    local vAccountOption = json.decode(vAccountInfo.options)
    -- 获取服务端地址
    local serverAddress = helper.channel_gateway_addr(vAccountOption.gateway)
    if serverAddress == "" then
        return json.encode({
            err_code = 500,
            err_message = "暂未配置支付网关"
        })
    end

    -- ....省略过程

    helper.channel_account_set_option(vAccountInfo.id, "client_id",  vParams.client_id)

    return json.encode({
            err_code = 200,
            err_message = string.format('登录成功 %s', returnInfo.Data.nick_name),
            data = {
                can_bind_token = false
            }
        })
end
```


## 自定义按钮操作


### 案例
```lua
plugin = {
    info = {
        channels = {
            wxpay = {
                {
                    label = "微信",
                    options = {
                        ....
                         -- 增加账号操作
                        actions = {
                            {
                                label = "唤醒",
                                func = "action_wake", -- 为空则无操作
                                type = "confirm", -- 操作类型 click:点击触发 confirm: 弹出是否确认 prompt: 输入内容 form: 弹出输入框
                                -- form_items = {}, -- 是否需要输入内容格式跟formItems一致 待实现
                                options = {
                                    tip = "是否需要唤醒", -- 如果为 confirm,prompt 就弹出此内容为提示
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

....


function plugin.action_wake(pAccountInfo,pUserInfo,pParams)
    return json.encode({
        err_code = 200,
        err_message = "唤醒请求已发送"
    })
end
```




## account级别的定时任务

```lua
-- 定时任务
-- pAccountInfo 账号信息
-- pPluginOption 插件配置
-- pExtArgs 扩展参数 在crontab中配置的args
function plugin.check_account(pAccountInfo, pPluginOption, crontabExtArgs)
    local vAccountInfo = json.decode(pAccountInfo)
    local vAccountOptions = json.decode(vAccountInfo.options)
    local vParams = json.decode(vAccountInfo.options)
end
```

## order级别的定时任务

```lua
-- 检查订单
-- pOrderInfo 订单信息
-- pAccountInfo 账号信息
-- pPluginOption 插件配置
-- crontabExtArgs 扩展参数 在crontab中配置的args
function plugin.check_order(pOrderInfo, pAccountInfo, pPluginOption, crontabExtArgs)
end

```
