
# DEMO

```
 templates--固定
    index--固定
        index1--模板名称
            index.html--首页文件
            header.html--模板头部
            footer.html--模板底部
 public--固定
    templates--固定
        index--固定
            index1--模板名称
                js--JS资源
                    main.js
                images--图片资源
                    banner1.png
                css--样式资源
                    main.css



```

index.html
```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>

    <script src="${.templateAssets}/js/1.js"></script>
</head>
<body>
<!-- 引入header块 需要引入的请放入include  -->
${include "include/header.html"}
<!-- 这里是使用get_option函数获取指定配置项(options表中的数据) -->
标题: ${"web_title" | get_option}

<!-- 固定变量 -->
资源存放路径: ${.templateAssets}
</body>
</html>
```

include/header.html
```
我是头部html
```