# 插件开发

插件使用Lua语言开发的,如果需要学习开发 可直接看项目自带的插件进行仿造


## 支付插件结构


### 插件入口

```
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
