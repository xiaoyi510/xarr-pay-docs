/** @type {import('tailwindcss').Config} */
export default {
  content: [
		'./docs/.vitepress/**/*.{js,ts,vue}',
		'./docs/**/*.md',
  ],
  theme: {
    extend: {},
  },
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/xiaoyi510/xarr-pay-docs/edit/main/docs/:path'
    }
  },
  plugins: [],
}

