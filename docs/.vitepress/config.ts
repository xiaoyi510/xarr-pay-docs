import { defineConfig } from 'vitepress';

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: 'zh-CN',
  title: 'XArr 文档中心',
  description: '一站式服务',

  themeConfig: {
    logo:"/assets/logo.png",
    nav: [
      { text: '主页', link: '/' },

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

    sidebar: [
      {
        // text: 'Guide',
        items: [
          { text: 'Example', link: '/example' },
          // ...
        ],
      },
    ],
    footer: {
      message: '高性能,安全,快速 就选XArr.',
      copyright: 'Copyright © 2022-present 包子'
    }
  },
});
