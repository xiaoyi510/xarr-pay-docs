import { defineConfig } from 'vitepress';

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: 'zh-CN',
  title: 'XArr 文档中心',
  description: '一站式服务',
  lastUpdated: true,
  head: [
    ['link', { ref: 'icon', href: '/favicon.png' }]
  ],

  themeConfig: {
    search: {
      provider: 'local'
    },
    logo: "/assets/images/logo.png",
    logoLink: "/",
    editLink: {
      pattern: 'https://github.com/xiaoyi510/xarr-pay-docs/edit/main/docs/:path',
      text: "编辑此页面"
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '目录',
      level: [2, 3]
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    externalLinkIcon: true,
    nav: [
      { text: '主页', link: '/' },
      { text: 'XArrPay个人版', link: '/person' },
      { text: 'XArrPay商户版', link: '/merchant' },
    ],

    sidebar: {
      '/person/': [
        {
          text: 'XArrPay个人版文档',
          items: [
            { text: 'Example', link: '/example' },
            // ...
          ],
        },
      ],
      '/merchant/': [
        {
          text: 'XArrPay商户版文档',
          items: [
            { text: '快速开始', link: '/merchant' },
            {
              text: '安装', items: [
                { text: "宝塔-Go项目安装", link: "/merchant/install/bt" },
                { text: "Docker", link: "/merchant/install/docker" },
              ]
            },
            {
              text:"通道",items:[
                { text: "易支付", link: "/merchant/channel/epay" },
                { text: "银联前置", link: "/merchant/channel/union" },
                { text: "京东收银台", link: "/merchant/channel/jdsyt" },
                { text: "V免签", link: "/merchant/channel/vmq" },
              ]
            },
            {
              text:"插件",items:[
                { text: "安装", link: "/merchant/plugins/install" },
                { text: "开发", link: "/merchant/plugins/dev" },
              ]
            },
            {
              text:"常见问题",items:[
                { text: "常见问题", link: "/merchant/questions/index" },
              ]
            },

          ],
        },
      ],
    },
    footer: {
      message: '高性能,安全,快速 就选XArr.',
      copyright: 'Copyright © 2022-present 包子'
    }
  },
});
