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
                { crontab = "*/50 * * * * *", fun = "sync_rate", name = "同步费率" },
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
