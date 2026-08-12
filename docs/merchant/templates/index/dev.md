# 首页模板开发

本指南介绍如何从零开发一套首页自定义模板。

## 一、目录结构

首页模板是**单页**静态模板,只有一个入口文件 `index.html`:

```
templates/index/模板名称/
├── index.html       # 首页文件(必须)
├── manifest.json    # 主题元数据(必须,否则不被识别)
└── assets/          # 静态资源,唯一可被外部访问的目录
    ├── js/
    ├── css/
    └── images/
```

## 二、manifest.json

首页模板必须带 `manifest.json`,`name` 与目录名一致,`type` 固定为 `2`(首页):

```json
{
  "name": "my_home",
  "title": "我的首页模板",
  "version": "1.0.0",
  "description": "自定义首页模板示例",
  "author": "you",
  "type": 2,
  "screenshot": "screenshot.png"
}
```

> 首页 `type` 必须为 `2`,支付为 `3`,收银台为 `5`,三者不能混用,否则会被判为「类型不匹配」而忽略。

## 三、模板变量

首页模板在返回前会经过一次模板引擎渲染,支持 `${...}` 语法。**首页注入的变量很少**,只有以下三个顶层变量:

| 变量名       | 说明                 | 示例值                                  |
| ------------ | -------------------- | --------------------------------------- |
| `.templateAssets` | 当前模板静态资源目录 | `/templates/index/my_home/assets` |
| `.templateRoot`   | 当前模板根目录       | `/templates/index/my_home/`       |
| `.domain`         | 当前访问域名         | `www.xarr.cn`                     |

> ⚠️ **首页模板没有** `orderInfo`、`baseUrl`、`merchantInfo` 等变量——那些只存在于支付模板。若首页需要读取站点配置,请用 `get_option` 函数(见下)。

## 四、读取站点配置 get_option

首页模板可通过 `${"配置key" | get_option}` 读取系统配置项(**与支付模板共用同一函数**)。常用 key:`web_title`、`web_keywords`、`web_description`、`web_favicon`、`web_logo` 等。

```html
<title>${"web_title" | get_option}</title>
<meta name="keywords" content='${"web_keywords" | get_option}' />
<img src="${.templateAssets}/logo.png" alt="logo">
```

## 五、hello world 示例

```
templates/index/my_home/
├── index.html
├── manifest.json
└── assets/
    └── js/main.js
```

`manifest.json`:

```json
{ "name": "my_home", "title": "我的首页", "type": 2 }
```

`index.html`:

```html
<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${"web_title" | get_option}</title>
    <link rel="stylesheet" href="${.templateAssets}/css/style.css">
</head>
<body>
    <h1>${"web_title" | get_option}</h1>
    <p>当前域名: ${.domain}</p>
    <script>document.write('<script src="' + '${.templateAssets}' + '/js/main.js">\x3C/script>')</script>
</body>
</html>
```

## 六、开发步骤

1. 在 `merchant-server/templates/index/` 下新建目录 `my_home`;
2. 写好 `index.html` 与 `assets/` 资源,资源引用统一用 `${.templateAssets}/` 前缀;
3. 写上 `manifest.json`(`name`=目录名,`type`=2);
4. 后台「首页类型」设为自定义模板,「首页模板」选择 `my_home` 即可生效。

## 校验清单

- [ ] 目录名仅含字母/数字/下划线
- [ ] `index.html` 存在
- [ ] `manifest.json` 存在,`name` 与目录一致、`type`=2
- [ ] 静态资源统一用 `${.templateAssets}/` 前缀
- [ ] 读站点配置用 `${"key" | get_option}`
