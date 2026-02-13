---
layout: home

hero:
  name: XArr官方文档中心
  text: 专业聚合支付系统
  tagline: 高性能 · 高安全 · 高并发 · 多通道 · 稳定可靠
  image:
    src: /assets/images/logo.png
    alt: Xarr
    width: 200
    height: 150
  actions:
    - theme: brand
      text: 快速开始
      link: /start
    - theme: alt
      text: 商户版文档
      link: /merchant
    - theme: alt
      text: 官方网站
      link: https://www.xarr.cn

features:
  - title: 🚀 高性能架构
    details: Go语言服务端 + Vue前端，支持高并发场景，稳定运行
  - title: 💳 多通道支持
    details: 支付宝、微信、银联、易支付、V免签等多种支付通道一站接入
  - title: 🔌 插件扩展
    details: 支持自定义插件开发，灵活扩展系统功能
  - title: 🔒 安全可靠
    details: 全自研开发，非二开系统，持续更新维护
  - title: 🛒 立即购买
    details: 前往授权中心购买授权并下载安装包
    link: 'https://auth.xarr.cn'
    linkText: 前往授权中心
  - title: 💬 社区交流
    details: 加入论坛与其他用户交流使用经验
    link: 'https://forum.uf3.cn'
    linkText: 前往论坛

---
<style>
:root {
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #1e88e5 30%, #64b5f6);

    --vp-home-hero-image-background-image: linear-gradient(-45deg, #1e88e5 50%, #64b5f6 50%);

    --vp-home-hero-image-filter: blur(44px);
  }

  @media (min-width: 640px) {
    :root {
      --vp-home-hero-image-filter: blur(56px);
    }
  }

  @media (min-width: 960px) {
    :root {
      --vp-home-hero-image-filter: blur(68px);
    }
  }


</style>
