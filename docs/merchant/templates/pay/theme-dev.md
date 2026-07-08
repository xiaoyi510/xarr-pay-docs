# 05 · 主题(模板)开发

主题分两个层面:

1. **前端工程**(`templates/<type>/<name>/`,源码,Vue + Vite)—— 你在这里写代码。
2. **构建产物** —— `vite build` 输出到主题目录,系统在这里识别并渲染主题。

---

## 一、主题类型与目录

系统支持三种主题类型:

| 目录 | 用途 |
|------|------|
| `templates/pay/` | 支付页(收银台核心,重点) |
| `templates/cashier/` | 收银台 |
| `templates/index/` | 首页 |

> 前端仓库里还有 `admin`(后台)、`user`(用户中心)、`install`(安装向导),它们是独立应用,不参与主题切换。

系统已内置多套支付主题:`templates/pay/` 下有 `default` 及 `pay2`~`pay13`;`templates/index/` 下有 `default`、`index1`、`shop`、`vip_buy`,可作为二次开发参考。

---

## 二、主题被识别的机制

**关键:系统靠主题目录里的 `template.json` 识别一套主题。** 扫描 `templates/<type>/` 下每个子目录,读取其中的 `template.json`;**没有 `template.json` 的目录会被忽略**。目录名即主题 ID。

### template.json 字段

```json
{
  "name": "支付模板2",          // 主题显示名(缺省用目录名)
  "version": "1.0.0",           // 版本(缺省 "1.0.0")
  "description": "pay2",        // 描述
  "author": "pay2",             // 作者
  "license": "pay2",            // 许可(可选)
  "screenshot": "screenshot.png"// 预览图文件名(相对主题目录),用于后台展示预览
}
```

> 主题目录名请使用 **字母 / 数字 / 下划线**(预览图接口对名称有此限制)。

---

## 三、支付主题的目录结构

支付主题是 **多页面** 静态站点,主题目录结构如下:

```
templates/pay/default/
├── index.html       # 主支付页(收银台)
├── status.html      # 支付状态页
├── separate.html    # 分离/聚合支付页
├── assets/          # js / css / 图片
└── template.json    # ← 自定义主题务必补上此文件
```

收银台主题(`templates/cashier/default/`)为单页:`index.html` + `assets/` + `favicon.ico`。

---

## 四、模板变量与内置函数(重点)

支付主题的 HTML **不是纯静态**,会在返回前经过一次模板渲染,支持 `${...}` 语法。示例:

```html
<meta name="keywords" content='${"web_keywords" | get_option}' />
<meta name="description" content='${"web_description" | get_option}' />
<link rel="icon" href='${"web_favicon" | get_option}' />
<title>${"web_index_title" | get_option} - 收银台</title>

<script type="module" crossorigin src="${.templateAssets}/js/index-f0d7e75d.js"></script>
<link rel="stylesheet" href="${.templateAssets}/css/index-7440fdf4.css">
```

### 两个必须掌握的点

**1. `${.templateAssets}` — 静态资源前缀变量**

所有 `assets/` 引用都要写成 `${.templateAssets}/...`,系统渲染时会替换成当前主题的实际资源 URL。这样切换主题、更换目录名时资源路径自动正确。

> 用 Vite 构建的主题,可在构建时把产物 HTML 里的 `./assets/` 重写为 `${.templateAssets}/`。手写 HTML 主题则直接写 `${.templateAssets}/`。

**2. `${"key" | get_option}` — 读取系统配置**

`|` 是模板管道,把左侧参数传给右侧内置函数。`get_option` 读取系统配置项。

语法:`${"<配置key>" | get_option}`。常用键:`web_keywords`、`web_description`、`web_favicon`、`web_index_title` 等站点配置。

---

## 五、前端工程(源码侧)约定

各前端工程用 Vite 构建,构建输出目录(`build.outDir`)指向对应主题目录。技术栈以各工程 `package.json` 为准(收银台/支付页/首页多为 Vue 2.7 + Vite 4)。

支付主题的多页面入口需在 Vite 的 `rollupOptions.input` 里声明 `index / status / separate` 三个 HTML。

---

## 六、新增一套自定义支付主题

### 方式 A:手写静态主题(最简单)

```
templates/pay/my_theme/
├── index.html      # 用 ${.templateAssets}/ 引用资源;需要配置时用 ${"key" | get_option}
├── status.html
├── separate.html
├── assets/         # 你的 js/css/img
├── screenshot.png  # 预览图
└── template.json   # { "name":"我的主题", "version":"1.0.0", "author":"you", "screenshot":"screenshot.png" }
```

放好后进后台主题管理,即可看到并选用。

### 方式 B:基于前端工程

1. 复制官方前端支付主题工程,把构建输出目录指向 `templates/pay/my_theme`。
2. 开发 Vue 组件;保证产物 HTML 用 `${.templateAssets}/` 前缀。
3. `yarn build`,产物落到主题目录。
4. 在产物目录补 `template.json` + `screenshot.png`。
5. 后台选用。

### 校验清单

- [ ] 目录名仅含字母/数字/下划线
- [ ] `template.json` 存在且字段完整
- [ ] `screenshot.png`(或 template.json 里指定的文件名)存在
- [ ] 支付主题含 `index.html` / `status.html` / `separate.html`
- [ ] 资源引用统一用 `${.templateAssets}/`
- [ ] 需读配置处用 `${"key" | get_option}`

---

## 七、要点回顾

| 概念 | 说明 |
|------|------|
| 识别依据 | 主题目录内的 `template.json`;无则忽略 |
| 主题 ID | 目录名 |
| 资源前缀 | `${.templateAssets}/` |
| 读配置 | `${"key" \| get_option}` |
| 支付主题页面 | index / status / separate |
| 支持类型 | pay / cashier / index |
