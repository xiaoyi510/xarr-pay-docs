## 模板函数

:::tip
以下为 `Golang` 标准库的一些基础语法和基础函数。
:::
变量可以使用符号 `|` 在函数间传递

```
${.value | Func1 | Func2}
```

使用括号

```
${printf "nums is %s %d" (printf "%d %d" 1 2) 3}
```

### `and`

```
${and .X .Y .Z}
```

`and` 会逐一判断每个参数，将返回第一个为空的参数，否则就返回最后一个非空参数

### `call`

```
${call .Field.Func .Arg1 .Arg2}
```

`call` 可以调用函数，并传入参数

调用的函数需要返回 1 个值 或者 2 个值，返回两个值时，第二个值用于返回 `error` 类型的错误。返回的错误不等于 `nil` 时，执行将终止。

### `index`

`index` 支持 `map`, `slice`, `array`, `string`，读取指定类型对应下标的值。

```
${index .Maps "name"}
```

### `len`

```
${printf "The content length is %d" (.Content|len)}
```

返回对应类型的长度，支持类型： `map`, `slice`, `array`, `string`, `chan`。

### `not`

`not` 返回输入参数的否定值。

例如，判断是否变量是否为空：

```
${if not .Var}
// 执行为空操作(.Var为空, 如: nil, 0, "", 长度为0的slice/map)
${else}
// 执行非空操作(.Var不为空)
${end}
```

### `or`

```
${or .X .Y .Z}
```

`or` 会逐一判断每个参数，将返回第一个非空的参数，否则就返回最后一个参数。

### `print`

同 `fmt.Sprint`。

### `printf`

同 `fmt.Sprintf`。

### `println`

同 `fmt.Sprintln`。

### `urlquery`

```
${urlquery "http://johng.cn"}
```

将返回

```
http%3A%2F%2Fjohng.cn
```

### `eq / ne / lt / le / gt / ge`

这类函数一般配合在 `if` 中使用

```
`eq`: arg1 == arg2
`ne`: arg1 != arg2
`lt`: arg1 < arg2
`le`: arg1 <= arg2
`gt`: arg1 > arg2
`ge`: arg1 >= arg2
```

`eq` 和其他函数不一样的地方是，支持多个参数。

```
${eq arg1 arg2 arg3 arg4}
```

和下面的逻辑判断相同:

```
arg1==arg2 || arg1==arg3 || arg1==arg4 ...
```

与 `if` 一起使用

```
${if eq true .Var1 .Var2 .Var3}...${end}
```

```
${if lt 100 200}...${end}
```

例如，判断变量不为空时执行：

```
${if .Var}
// 执行非空操作(.Var不为空)
${else}
// 执行为空操作(.Var为空, 如: nil, 0, "", 长度为0的slice/map)
${end}
```

### 对比函数改进

模板引擎对标准库自带的对比模板函数 `eq/ne/lt/le/gt/ge` 做了必要的改进，以便支持任意数据类型的比较。例如，在标准库模板中的以下比较：

```
${eq 1 "1"}
```

将会引发错误：

```
panic: template: at <eq 1 "1">: error calling eq: incompatible types for comparison
```

由于比较的两个参数不是同一数据类型，因此引发了 `panic` 错误。

在模板引擎中，将会自动将两个参数进行数据转换，转换为同一类型后再进行比较，这样的开发体验更好、灵活性更高。如果两个参数均为整型变量（或者整型字符串），那么将会转换为整型进行比较，否则转换为字符串变量进行比较（区分大小写）。



## 内置函数


### `plus/minus/times/divide`

| 函数 | 说明 | 格式 | 示例 | 备注 |
| --- | --- | --- | --- | --- |
| `plus` | **加** | `${.value1 \| plus .value2}` | `${2 \| plus 3} => 5` | `3+2` |
| `minus` | **减** | `${.value1 \| minus .value2}` | `${2 \| minus 3} => 1` | `3-2` |
| `times` | **乘** | `${.value1 \| times .value2}` | `${2 \| times 3} => 6` | `3*2` |
| `divide` | **除** | `${.value1 \| divide .value2}` | `${2 \| divide 3} => 1.5` | `3/2` |

### `text`

```
${.value | text}
```

将 `value` 变量值去掉HTML标签，仅显示文字内容（并且去掉 `script` 标签）。 示例：

```
${"<div>测试</div>"|text}
// 输出: 测试
```

### `htmlencode/encode/html`

```
${.value | htmlencode}
${.value | encode}
${.value | html}
```

将 `value` 变量值进行html转义。 示例：

```
${"<div>测试</div>"|html}
// 输出: &lt;div&gt;测试&lt;/div&gt;
```

### `htmldecode/decode`

```
${.value | htmldecode}
${.value | decode}
```

将 `value` 变量值进行html反转义。 示例：

```
${"&lt;div&gt;测试&lt;/div&gt;" | htmldecode}
// 输出: <div>测试</div>
```

### `urlencode/url`

```
${.url | url}
```

将 `url` 变量值进行 `url` 转义。 示例：

```
${"https://goframe.org" | url}
// 输出: https%3A%2F%2Fgoframe.org
```

### `urldecode`

```
${.url | urldecode}
```

将 `url` 变量值进行 `url` 反转义。 示例：

```
${"https%3A%2F%2Fgoframe.org"|urldecode}
// 输出: https://goframe.org
```

### `date`

```
${.timestamp | date .format}
${date .format .timestamp}
${date .format}
```

将 `timestamp` 时间戳变量进行时间日期格式化，类似PHP的 `date` 方法， `format` 参数支持 [PHP date](http://php.net/manual/en/function.date.php) 方法格式 。

当 `timestamp` 变量为 `空`(或者 `0`)时，表示以当前时间作为时间戳参数执行打印。

示例：

```
${1540822968 | date "Y-m-d"}
${"1540822968" | date "Y-m-d H:i:s"}
${date "Y-m-d H:i:s"}
// 输出:
// 2018-10-29
// 2018-10-29 22:22:48
// 2018-12-05 10:22:00
```

### `compare`

```
${compare .str1 .str2}
${.str2 | compare .str1}
```

将 `str1` 和 `str2` 进行字符串比较，返回值： \- 0 : `str1` == `str2` \- 1 : `str1` \> `str2` \- -1 : `str1` < `str2`

示例：

```
${compare "A" "B"}
${compare "1" "2"}
${compare 2 1}
${compare 1 1}
// 输出:
// -1
// -1
// 1
// 0
```

### `replace`

```
${.str | replace .search .replace}
${replace .search .replace .str}
```

将 `str` 中的 `search` 替换为 `replace`。 示例：

```
${"I'm中国人" | replace "I'm" "我是"}
// 输出:
// 我是中国人
```

### `substr`

```
${.str | substr .start .length}
${substr .start .length .str}
```

将 `str` 从 `start` 索引位置（索引从0开始）进行字符串截取 `length`，支持中文，类似PHP的 `substr` 函数。 示例：

```
${"我是中国人" | substr 2 -1}
${"我是中国人" | substr 2  2}
// 输出:
// 中国人
// 中国
```

### `strlimit`

```
${.str | strlimit .length .suffix}
```

将 `str` 字符串截取 `length` 长度，支持中文，超过长度则追加 `suffix` 字符串到末尾。 示例：

```
${"我是中国人" | strlimit 2  "..."}
// 输出:
// 我是...
```

### `concat`

```
${concat .str1 .str2 .str3...}
```

拼接字符串。 示例：

```
${concat "我" "是" "中" "国" "人"}
// 输出:
// 我是中国人
```

### `hidestr`

```
${.str | hidestr .percent .hide}
```

将 `str` 字符串按照 `percent` 百分比从字符串中间向两边隐藏字符（主要用于姓名、手机号、邮箱地址、身份证号等的隐藏），隐藏字符由 `hide` 变量定义。 支持中文，支持email格式。 示例：

```
${"热爱XArr热爱生活" | hidestr 20  "*"}
${"热爱XArr热爱生活" | hidestr 50  "*"}
// 输出:
// 热爱XArr*爱生活
// 热爱****生活
```

### `highlight`

```
${.str | highlight .key .color}
```

将 `str` 字符串中的关键字 `key` 按照定义的颜色 `color` 进行前置颜色高亮。 示例：

```
${"热爱XArr热爱生活" | highlight "XArr" "red"}
// 输出:
// 热爱<span style="color:red;">XArr</span>热爱生活
```

### `toupper/tolower`

```
${.str | toupper}
${.str | tolower}
```

将 `str` 字符串进行大小写转换。 示例：

```
${"xarr" | toupper}
${"XARR" | tolower}
// 输出:
// XARR
// xarr
```

### `nl2br`

```
${.str | nl2br}
```

将 `str` 字符串中的 `\n/\r` 替换为html中的 `<br />` 标签。 示例：

```
${"Go\nFrame" | nl2br}
// 输出:
// Go<br />Frame
```

### `dump`

```
${dump .var}
```

格式化打印变量，功能类似于 `g.Dump` 方法，常用于开发调试。 示例：

```
gview.Assign("var", g.Map{
    "name" : "john",
})
```

```
${dump .var}
// 输出:
// <!--
// {
//     name: "john"
// }
// -->
```

### `map`

```
${map .var}
```

将模板变量转换为 `map[string]interface{}` 类型，常用于 `range...end` 遍历。

### `maps`

```
${maps .var}
```

将模板变量转换为 `[]map[string]interface{}` 类型，常用于 `range...end` 遍历。

### `json/xml/ini/yaml/yamli/toml`

| 函数 | 说明 | 格式 |
| --- | --- | --- |
| `json` | 将模板变量转换为 `JSON` 格式字符串。 | `${json .var}` |
| `xml` | 将模板变量转换为 `XML` 格式字符串。 | `${xml .var}` |
| `ini` | 将模板变量转换为 `INI` 格式字符串。 | `${ini .var}` |
| `yaml` | 将模板变量转换为 `YAML` 格式字符串。 | `${yaml .var}` |
| `yamli` | 将模板变量转换为带有自定义缩进的 `YAML` 格式字符串。 | `${yamli .var .indent}` |
| `toml` | 将模板变量转换为 `TOML` 格式字符串。 | `${toml .var}` |
