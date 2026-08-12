# 模板引擎语法

主题 HTML 会经过 Go 模板引擎(GoFrame gview)渲染,默认分隔符为 **`${ }`**。本页介绍引擎支持的全部语法,**适用于支付/收银台/首页所有类型的主题**。

## 基本语法与变量渲染

模板默认变量分隔符为 `${ }`:

```html
<div>
    订单号：${.orderInfo.order_id}<br>
    支付方式：${.orderInfo.pay_type}<br>
    金额：${.orderInfo.amount} 元
</div>
```

> 各类型主题可用的具体变量见 [模板变量](/merchant/templates/variable)。

## 支持的 Go 符号

```
${"string"}     // 一般 string
${`raw string`} // 原始 string
${'c'}          // byte
${print nil}    // nil 也被支持
```

## pipeline(管道)

可以是上下文的变量输出,也可以是函数通过管道传递的返回值:

```
${. | FuncA | FuncB | FuncC}
```

当 `pipeline` 的值等于:

- `false` 或 `0`
- `nil` 的指针或 `interface`
- 长度为 `0` 的 `array`、`slice`、`map`、`string`

那么这个 `pipeline` 被认为是空。

:::warning
注意:当模板中展示的指定变量不存在时,将显示为空(标准库模板引擎会展示 `<no value>`)。
:::

## `if … else … end`

```go
${if pipeline}...${end}
```

`if` 判断时,`pipeline` 为空时相当于判断为 `false`。支持嵌套:

```go
${if .condition}
    ...
${else}
    ${if .condition2}
        ...
    ${end}
${end}
```

也可以使用 `else if`:

```go
${if .condition}
    ...
${else if .condition2}
    ...
${else}
    ...
${end}
```

## `range … end`

```
${range pipeline} ${.} ${end}
```

`pipeline` 支持的类型为 `slice`、`map`、`channel`。对应的值长度为 `0` 时,`range` 不会执行,`.` 不会改变。

遍历 `map`:

```go
${range $key, $value := .MapContent}
    ${$key}:${$value}
${end}
```

遍历 `slice`:

```go
${range $index, $elem := .SliceContent}
    ${range $key, $value := $elem}
        ${$key}:${$value}
    ${end}
${end}
```

## `with … end`

`with` 用于重定向 `pipeline`：

```go
${with .Field.NestField.SubField}
    ${.Var}
${end}
```

## `define`

`define` 用来**自定义模板内容块**(给一段模板内容定义一个模板名称),可用于模块定义和模板嵌套(配合 `template` 标签使用):

```go
${define "loop"}
    <li>${.Name}</li>
${end}
```

:::warning
`define` 标签需结合 `template` 标签使用,支持跨模板(在同一模板目录/子目录下有效,原理是使用 `ParseFiles` 方法解析模板文件)。
:::

## `template`

```
${template "模板名称" pipeline}
```

将对应的上下文 `pipeline` 传给模板,才可以在模板中调用。注意:参数是**模板名称**,不是文件路径,`template` 标签不支持文件路径。

```html
<ul>
    ${range .Items}
        ${template "loop" .}
    ${end}
</ul>
```

:::warning
`template` 标签需结合 `define` 标签使用,支持跨模板(在同一模板目录/子目录下有效)。
:::

## `include`

```
${include "模板文件名(需要带完整文件名后缀)" pipeline}
```

载入其他模板(任意路径),文件名支持**相对路径**以及系统**绝对路径**。想把当前模板的变量传递给子模板时:

```
${include "模板文件名(需要带完整文件名后缀)" .}
```

与 `template` 标签的区别:`include` 仅支持**文件路径**、不支持**模板名称**;`template` 仅支持**模板名称**、不支持**文件路径**。

### include 公共片段

```html
${include "include/header.html"}
<!-- 主体内容 -->
${include "include/footer.html"}
```

:::warning
为嵌套子模板传递模板变量时,应使用 `${include "xxx" .}` 语法。
:::

## 注释

允许多行文本注释,不允许嵌套:

```
${/*
comment content
support new line
*/}
```

## 删除空白符号

`${-` 去除模板内容左侧的所有空白符号,`-}` 去除模板内容右侧的所有空白符号。

> 注意:`-` 要紧挨 `${` 和 `}`,同时与模板值之间需要使用空格分隔。

```
${- .Name -}

${- range $key, $value := .list}
  "${$value}"
${- end}
```

## 模板布局示例

### 方式一:define + template

```
layouts/
  ├─ layout.html
  ├─ header.html
  ├─ footer.html
  └─ container.html
```

`layout.html`:

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

`header.html`:

```html
${define "header"}
    <h1>${.header}</h1>
${end}
```

`container.html`:

```html
${define "container"}
<h1>${.container}</h1>
${end}
```

### 方式二:include

`layout.html`:

```html
${include "header.html" .}
${include .mainTpl .}
${include "footer.html" .}
```

`header.html` / `footer.html` / `main1.html` / `main2.html` 各为一个独立片段(直接用 `${...}` 写内容,无需 define)。
