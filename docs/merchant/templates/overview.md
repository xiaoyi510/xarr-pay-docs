# 主题机制总览

主题(模板)是整套可独立替换的静态页面,放置在 `templates/<type>/<name>/` 目录下,通过 `manifest.json` 被系统识别。

主题分两个层面:

1. **前端工程**(`templates/<type>/<name>/`,源码,Vue + Vite)——开发者在这里写代码。
2. **构建产物** —— `vite build` 输出到主题目录,系统在这里识别并渲染主题。

---

## 一、主题类型与目录

系统支持三种主题类型,对应的开发文档见各自分组:

| 目录 | 用途 | 页面数 | 文档 |
|------|------|--------|------|
| `templates/pay/` | 支付页 | 3 页(index / status / separate) | [支付主题开发](/merchant/templates/pay/index) |
| `templates/cashier/` | 收银台 | 1 页(index.html) | [收银台主题开发](/merchant/templates/cashier/index) |
| `templates/index/` | 首页 | 1 页(index.html) | [首页主题开发](/merchant/templates/index/dev) |

> 前端仓库里还有 `admin`(后台)、`user`(用户中心)、`install`(安装向导),它们是独立应用,**不参与主题切换**。

系统已内置多种主题,可作为二次开发参考:`templates/pay/` 下有 `default` 及 `pay2`~`pay13`;`templates/index/` 下有 `default`、`index1`、`shop`、`vip_buy`。

---

## 二、主题被识别的机制

**关键:系统靠主题目录里的 `manifest.json` 识别一套主题。** 扫描 `templates/<type>/` 下每个子目录,读取其中的 `manifest.json`;**没有 `manifest.json` 的目录会被忽略**。目录名即主题 ID。

> `manifest.json` 是主题/插件共用的一套元数据,已取代早期的 `template.json`,成为主题的唯一元数据源。

### manifest.json 字段

```json
{
  "name": "my_theme",        // 主题标识,必须与目录名一致
  "title": "我的主题",        // 主题显示名(缺省用目录名)
  "version": "1.0.0",         // 版本(缺省 "1.0.0")
  "description": "描述",
  "author": "author",         // 作者
  "type": 3,                  // 类型: 2=首页 3=支付 5=收银台,用于类型校验
  "min_program_version": "1.5.0.0", // 最低系统版本,可选
  "screenshot": "screenshot.png"      // 本地预览图文件名(相对主题目录),可选
}
```

> **`type` 是必须与目录归属一致的类型数值**:`index` 目录下主题必须为 `2`、`pay` 下为 `3`、`cashier` 下为 `5`,否则会在主题管理中被判为"类型不匹配"而忽略。
>
> 主题目录名请使用 **字母 / 数字 / 下划线**(预览图接口对名称有此限制)。

---

## 三、资源引用:模板变量 `${.templateAssets}`

主题 HTML **不是纯静态**,返回前会经过一次模板引擎渲染,支持 `${...}` 语法。**所有 `assets/` 引用都必须用 `${.templateAssets}/` 前缀**,系统渲染时会替换成当前主题的实际资源 URL,这样切换主题、更换目录名时资源路径自动正确。

```html
<meta name="keywords" content='${"web_keywords" | get_option}' />
<meta name="description" content='${"web_description" | get_option}' />
<link rel="icon" href='${"web_favicon" | get_option}' />
<title>${"web_index_title" | get_option} - 收银台</title>

<script type="module" crossorigin src="${.templateAssets}/js/index-f0d7e75d.js"></script>
<link rel="stylesheet" href="${.templateAssets}/css/index-7440fdf4.css">
```

> 用 Vite 构建的主题,可在构建时把产物 HTML 里的 `./assets/` 重写为 `${.templateAssets}/`。手写 HTML 主题则直接写 `${.templateAssets}/`。

各类型主题注入的**可用变量清单**见 [模板变量](/merchant/templates/variable) 中按类型的说明。

## 四、读取系统配置 `get_option`

`|` 是模板管道,把左侧参数传给右侧内置函数。`get_option` 读取系统配置项,所有类型主题通用。

语法:`${"<配置key>" | get_option}`。常用键:`web_title`、`web_keywords`、`web_description`、`web_favicon`、`web_index_title` 等站点配置。

```html
<title>${"web_title" | get_option} - 收银台</title>
```

---

## 五、前端工程约定

各前端工程用 Vite 构建,构建输出目录(`build.outDir`)指向对应主题目录。技术栈以各工程 `package.json` 为准(收银台/支付页/首页多为 Vue 2.7 + Vite 4)。

支付主题的多页面入口需在 Vite 的 `rollupOptions.input` 里声明 `index / status / separate` 三个 HTML;收银台、首页为单页,声明 `index.html` 即可。

---

## 六、模板引擎与函数

- **模板引擎语法**(`${if/range/with/define/include}` 等)见 [模板引擎语法](/merchant/templates/engine)。
- **内置函数速查**(`get_option`、`plus/times`、`date`、`substr`、`json` 等)见 [模板函数](/merchant/templates/funcs)。

---

## 七、如何新增一套主题

以支付主题为例,三种类型流程相同(目录与 `type` 值不同):

### 方式 A:手写静态主题(最简单)

```
templates/pay/my_theme/
├── index.html      # 用 ${.templateAssets}/ 引用资源;需要配置时用 ${"key" | get_option}
├── status.html
├── separate.html
├── assets/         # 你的 js/css/img
├── screenshot.png  # 预览图
└── manifest.json   # { "name":"my_theme", "title":"我的主题", "version":"1.0.0", "author":"you", "type":3, "screenshot":"screenshot.png" }
```

放好后进后台主题管理,即可看到并选用。

### 方式 B:基于前端工程

1. 复制官方对应主题工程,把构建输出目录指向目标主题目录(如 `templates/pay/my_theme`)。
2. 开发 Vue 组件;保证产物 HTML 用 `${.templateAssets}/` 前缀。
3. `yarn build`,产物落到主题目录。
4. 在产物目录补 `manifest.json` + `screenshot.png`。
5. 后台选用。

### 校验清单

- [ ] 目录名仅含字母/数字/下划线
- [ ] `manifest.json` 存在,且 `name` 与目录名一致、`type` 与归属类型一致
- [ ] `screenshot.png`(或 manifest.json 里指定的文件名)存在
- [ ] 支付主题含 `index.html` / `status.html` / `separate.html`;收银台、首页含 `index.html`
- [ ] 资源引用统一用 `${.templateAssets}/`
- [ ] 需读配置处用 `${"key" | get_option}`
