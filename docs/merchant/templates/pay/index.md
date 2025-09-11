# 支付页模板开发指南

本指南旨在帮助开发者规范地创建和维护支付页模板，确保模板结构清晰、资源引用合理，便于后续扩展与维护。

---

## 一、目录结构说明

支付页模板建议采用如下目录结构：

```
templates/pay/
  └─ [主题名称]/
      ├─ index.html          # 支付页主文件
      ├─ template.json       # 主题基础描述
      └─ assets/             # 静态资源目录（可被外部访问）
          ├─ js/             # JavaScript 资源
          ├─ css/            # 样式资源
          ├─ images/         # 图片资源
          └─ font/           # 字体资源
```

- `[主题名称]`：自定义主题文件夹名称，便于多主题管理。
- `index.html`：支付页模板主入口文件。
- `template.json`：主题基础信息。
- `assets/`：所有静态资源均应放置于此，避免主目录暴露敏感文件。

---

> template.json 结构如下

```json
{
  "name": "现代浮窗风格支付模板",
  "version": "1.0.0",
  "description": "现代浮窗风格支付模板",
  "author": "XArrPay",
  "license": "MIT",
  "screenshot": "screenshot.png" # 主题缩略图
}

```

## 二、资源引用规范

模板中引用静态资源时，需使用内置变量 `${.templateAssets}` 作为资源路径前缀，确保路径正确、主题切换无影响。

**示例：**

```html
<!-- 引用 JS 资源 -->
<script src="${.templateAssets}/js/jquery.min.js"></script>

<!-- 引用图片资源，动态展示logo -->
<img src="${.templateAssets}/images/logo.png" alt="Logo" class="max-h-[36px]">
```

- `${.templateAssets}`：自动指向当前主题的 assets 目录。

---

## 三、开发建议

1. **资源隔离**：每个主题的资源应独立存放，避免命名冲突。
2. **路径规范**：所有静态资源路径均应通过 `${.templateAssets}` 变量拼接，禁止硬编码绝对路径。
3. **模板复用**：如有公共片段（如 header、footer），建议拆分为独立文件并通过模板引擎 include 方式引入。
4. **变量使用**：充分利用内置变量和订单信息，提升模板灵活性。

---

如需进一步自定义模板行为或扩展功能，请参考主文档及相关注释，或联系开发团队获取支持。

---

## 四、模板引擎用法说明


### 1. 基本语法与变量渲染

模板默认变量分隔符为 `${ }`

**模板示例（index.html）：**

```html
<div>
    订单号：${.orderInfo.order_id}<br>
    支付方式：${.orderInfo.pay_type}<br>
    金额：${.orderInfo.amount} 元
</div>
```

### 2. include 公共片段

可在模板中通过 `include` 引入公共片段，如 header/footer：

```html
${include "include/header.html"}
<!-- 主体内容 -->
${include "include/footer.html"}
```

### 3. 支持的语法


**模板中支持的 `go` 语言符号**

```
${"string"}     // 一般 string
${`raw string`} // 原始 string
${'c'}          // byte
${print nil}    // nil 也被支持
```

**模板中的 `pipeline`**

可以是上下文的变量输出，也可以是函数通过管道传递的返回值

```
${. | FuncA | FuncB | FuncC}
```

当 `pipeline` 的值等于:

- `false` 或 `0`
- `nil的指针` 或 `interface`
- 长度为 `0` 的 `array`, `slice`, `map`, `string`

那么这个 `pipeline` 被认为是空。
:::warning
需要注意：在模板引擎中，当模板中展示的指定变量不存在时，将会显示为空（标准库模板引擎会展示 `<no value>`）。
:::
### `if … else … end`

```
${if pipeline}...${end}
```

`if` 判断时， `pipeline` 为空时，相当于判断为 `false`。

支持嵌套的循环

```
${if .condition}
    ...
${else}
    ${if .condition2}
        ...
    ${end}
${end}
```

也可以使用 `else if` 进行

```
${if .condition}
    ...
${else if .condition2}
    ...
${else}
    ...
${end}
```

### `range … end`

```
${range pipeline} ${.} ${end}
```

`pipeline` 支持的类型为 `slice`, `map`, `channel`。



此外，对应的值长度为 `0` 时， `range` 不会执行， `.` 不会改变。

例如，遍历 `map`:

```
${range $key, $value := .MapContent}
    ${$key}:${$value}
${end}
```

例如，遍历 `slice`:

```
${range $index, $elem := .SliceContent}
    ${range $key, $value := $elem}
        ${$key}:${$value}
    ${end}
${end}
```

### `with … end`

```
${with pipeline}...${end}
```

`with` 用于重定向 `pipeline`

```
${with .Field.NestField.SubField}
    ${.Var}
${end}
```

### `define`

`define` 可以用来 **自定义模板内容块**(给一段模板内容定义一个模板名称)，可用于模块定义和模板嵌套(使用在 `template` 标签中)。

```
${define "loop"}
    <li>${.Name}</li>
${end}
```

其中 `loop` 为该模板内容块的名称，随后可使用 `template` 标签调用模板：

```
<ul>
    ${range .Items}
        ${template "loop" .}
    ${end}
</ul>
```
:::warning
`define` 标签需要结合 `template` 标签一起使用，并且支持跨模板使用（在同一模板目录/子目录下有效，原理是使用的 `ParseFiles` 方法解析模板文件）。
:::
### `template`

```
${template "模板名称" pipeline}
```

将对应的上下文 `pipeline` 传给模板，才可以在模板中调用。

注意： `template` 标签参数为 `模板名称`，而不是模板文件路径， `template` 标签不支持模板文件路径。
:::warning
`template` 标签需要结合 `define` 标签一起使用，并且支持跨模板使用（在同一模板目录/子目录下有效，原理是使用的 `ParseFiles` 方法解析模板文件）。
:::
### `include`

```
${include "模板文件名(需要带完整文件名后缀)" pipeline}
```

在模板中可以使用 `include` 标签载入其他模板（任意路径），模板文件名支持 **相对路径** 以及文件的系统 **绝对路径**。如果想要把当前模板的模板变量传递给子模板(嵌套模板)，可以这样：

```
${include "模板文件名(需要带完整文件名后缀)" .}
```

与 `template` 标签的区别是： `include` 仅支持 **文件路径**，不支持 **模板名称**；而 `tempalte` 标签仅支持 **模板名称**，不支持 **文件路径**。

### 注释

允许多行文本注释，不允许嵌套。

```
${/*
comment content
support new line
*/}
```

### 删除空白符号

删除移除空格换行符

```
# 使用${-语法去除模板内容左侧的所有空白符号， 使用-}去除模板内容右侧的所有空白符号。

# 注意：-要紧挨${和}，同时与模板值之间需要使用空格分隔。

${- .Name -}

${- range $key, $value := .list}
  "${$value}"
${- end}
```


## 五、 模板布局


### 模板使用案例

目录结构

```
layouts/
  ├─ layout.html
  ├─ header.html
  ├─ footer.html
  └─ container.html
```



1. `layout.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Layout</title>
    ${template "header" .}
</head>
<body>
    <div class="container">
    ${template "container" .}
    </div>
    <div class="footer">
    ${template "footer" .}
    </div>
</body>
</html>
```

2. `header.html`
```html
${define "header"}
    <h1>${.header}</h1>
${end}
```

1. `container.html`
```html
${define "container"}
<h1>${.container}</h1>
${end}
```

1. `footer.html`
```html
${define "footer"}
<h1>${.footer}</h1>
${end}
```


### `include` 模板嵌入

当然我们也可以使用 `include` 标签来实现页面布局。
:::warning
注意，为嵌套的子模板传递模板变量时，应当使用： `${include "xxx" .}` 的语法。
:::
使用示例：


1. `layout.html`
```html
${include "header.html" .}
${include .mainTpl .}
${include "footer.html" .}
```

2. `header.html`
```html
<h1>HEADER</h1>
```

3. `footer.html`
```html
<h1>FOOTER</h1>
```

4. `main1.html`
```html
<h1>MAIN1</h1>
```

1. `main2.html`
```html
<h1>MAIN2</h1>
```


