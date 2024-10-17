
import DefaultTheme from 'vitepress/dist/client/theme-default/index.js'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client';

import './tailwind.postcss'
import './style.css';

export default {
    ...DefaultTheme,

    enhanceApp({ app, router, siteData }) {
        // ...
        enhanceAppWithTabs(app);
    },
}