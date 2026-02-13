import { defineConfig } from "vitepress";
//图片灯箱插件
import mdItCustomAttrs from "markdown-it-custom-attrs";
// refer https://vitepress.dev/reference/site-config for details

import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";

import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid({
  lang: "zh-CN",
  title: "XArr 官网网站-文档中心",
  description: "XArrPay 支付系统官方文档中心,提供XArrPay的各项文档信息",
  lastUpdated: true,
  mermaid: {
    // 配置参考：https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults
  },
  mermaidPlugin: {
    class: "mermaid my-class", // 为父容器设置额外的CSS类
  },
  sitemap: {
    hostname: "https://docs.xarr.cn",
    lastmodDateOnly: false,
  },
  head: [
    ["link", { ref: "icon", href: "/favicon.png" }],
    ["link", { rel: "stylesheet", href: "../assets/css/fancybox.css" }],
    ["script", { src: "../assets/js/fancybox.umd.js" }],
  ],
  //图片灯箱相关配置
  markdown: {
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, "image", {
        "data-fancybox": "gallery",
      });

      md.use(tabsMarkdownPlugin);
    },
  },

  themeConfig: {
    search: {
      provider: "local",
    },
    logo: "/assets/images/logo.png",
    logoLink: "/",
    editLink: {
      pattern:
        "https://github.com/xiaoyi510/xarr-pay-docs/edit/main/docs/:path",
      text: "编辑此页面",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    outline: {
      label: "目录",
      level: [2, 3],
    },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    externalLinkIcon: true,
    nav: [
      { text: "主页", link: "/" },
{ text: "XArrPay商户版", link: "/merchant" },
      { text: "授权中心", link: "https://auth.xarr.cn" },
      { text: "博客", link: "https://blog.52nyg.com" },
      { text: "官方网站", link: "https://www.xarr.cn" },
      { text: "合规声明", link: "/compliance" },
    ],

    sidebar: {
"/merchant/": [
        {
          text: "XArrPay商户版文档",
          items: [
            { text: "快速开始", link: "/merchant" },
            {
              text: "安装",
              items: [
                { text: "环境要求", link: "/merchant/install/env" },
                { text: "下载安装包", link: "/merchant/install/download" },
                { text: "宝塔-Go项目安装", link: "/merchant/install/bt" },
                { text: "Docker", link: "/merchant/install/docker" },
              ],
            },
            {
              text: "命令行",
              link: "/merchant/cli/index"
            },
            {
              text: "通道",
              items: [
                {
                  text: "支付宝",
                  items: [
                    { text: "账单模式", link: "/merchant/channel/alipay_bill" },
                    { text: "H5支付", link: "/merchant/channel/alipay_h5" },
                    { text: "手机网站支付", link: "/merchant/channel/alipay_wap" },
                    { text: "电脑网站支付", link: "/merchant/channel/alipay_pc" },
                    { text: "当面付", link: "/merchant/channel/alipay_face" },
                  ],
                },
                {
                  text: "微信",
                  items: [
                    {
                      text: "微信JSAPI",
                      link: "/merchant/channel/wxpay_jsapi",
                    },
                    {
                      text: "微信Native(V3)",
                      link: "/merchant/channel/wxpay_native",
                    },
                  ],
                },
                { text: "易支付", link: "/merchant/channel/epay" },
                { text: "银联前置", link: "/merchant/channel/union" },
                { text: "京东收银台", link: "/merchant/channel/jdsyt" },
                { text: "V免签", link: "/merchant/channel/vmq" },
                { text: "计全支付", link: "/merchant/channel/jqpay" },
                { text: "虎皮椒", link: "/merchant/channel/xunhupay" },
              ],
            },
            {
              text: "插件",
              items: [
                { text: "安装", link: "/merchant/plugins/install" },
                { text: "开发", link: "/merchant/plugins/dev" },
                { text: "上报API", link: "/merchant/plugins/report-api" },
                { text: "功能函数", link: "/merchant/plugins/funcs" },
              ],
            },
            {
              text: "系统接入",
              items: [{ text: "易支付", link: "/merchant/xpay/epay" }],
            },
            {
              text: "模板",
              items: [
                {
                  text: "首页模板",
                  items: [
                    { text: "模板引擎", link: "/merchant/templates/index/" },
                    { text: "模板开发", link: "/merchant/templates/index/dev" },
                  ],
                },
                {
                  text: "通知模板",
                  items: [
                    {
                      text: "模板配置案例",
                      link: "/merchant/templates/notification/index",
                    },
                    {
                      text: "即时消息",
                      link: "/merchant/templates/notification/websocket-tip",
                    },
                  ],
                },
                {
                  text: "支付模板",
                  items: [
                    { text: "模板开发", link: "/merchant/templates/pay/index" },
                    { text: "模板函数", link: "/merchant/templates/pay/funcs" },
                    {
                      text: "模板变量",
                      link: "/merchant/templates/pay/variable",
                    },
                    { text: "模板API", link: "/merchant/templates/pay/api" },
                  ],
                },
              ],
            },
            {
              text: "常见问题",
              items: [
                { text: "常见问题", link: "/merchant/questions/index" },
                { text: "回调问题", link: "/merchant/questions/callback" },
                { text: "访问相关", link: "/merchant/questions/request" },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      message: "高性能,安全,快速 就选XArr.",
      copyright: "Copyright © 2022-present 包子",
    },
  },
});
