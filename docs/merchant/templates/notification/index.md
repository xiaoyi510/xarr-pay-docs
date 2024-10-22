# 通知模板分享


## 包子的分享

:::tabs
== 订单

**预览效果**

<div class="p-3 border-dashed border-2 border-gray-200 ">

<!--@include: ./baozi/order.html-->

</div>

**HTML代码**

<<< ./baozi/order.html [订单]



== 邮件验证码

**预览效果**


<div class="p-3 border-dashed border-2 border-gray-200 ">
<!--@include: ./baozi/email_code.html-->
</div>

**HTML代码**


<<< ./baozi/email_code.html [邮件验证码]

== 微信订单创建/支付成功
微信公众号模板: 工具 -	信息查询 - 订单支付成功通知	
```
{
    "thing8": {
        "value": "{{subject}}"
    },
    "character_string2": {
        "value": "{{order_id}}"
    },
    "amount3": {
        "value": "{{trade_amount}}"
    },
    "thing6": {
        "value": "{{pay_type}}"
    },
    "time4": {
        "value": "{{create_time}}"
    }
}

```

:::
