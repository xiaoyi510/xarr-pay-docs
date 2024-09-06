import { defineConfig } from 'vitepress';

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: 'zh-CN',
  title: 'XArr 文档中心',
  description: '一站式服务',
  lastUpdated: true,

  themeConfig: {
    search: {
      provider: 'local'
    },
    logo:"/assets/logo.png",
    editLink: {
      pattern: 'https://github.com/xiaoyi510/xarr-pay-docs/edit/main/docs/:path',
      text:"编辑此页面"
    },
    nav: [
      { text: '主页', link: '/' },
      { text: 'XArrPay个人版', link: '/person' },
      { text: 'XArrPay商户版', link: '/merchant' },

      // {
      //   text: 'Dropdown Menu',
      //   items: [
      //     { text: 'Item A', link: '/item-1' },
      //     { text: 'Item B', link: '/item-2' },
      //     { text: 'Item C', link: '/item-3' },
      //   ],
      // },

      // ...
    ],

    sidebar: {
      '/person/':[
        {
          text: 'XArrPay个人版文档',
          items: [
            { text: 'Example', link: '/example' },
            // ...
          ],
        },
      ],
      '/merchant/':[
        {
          text: 'XArrPay商户版文档',
          items: [
            { text: 'Example', link: '/example' },
            // ...
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
