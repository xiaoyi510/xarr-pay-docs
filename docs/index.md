---
layout: home

hero:
  name: 文档中心
  text: 一站式支付服务,提供一流的交互,高性能的服务
  tagline: 高性能, 高安全, 高并发, 多通道, 稳, 无刻意后门~~
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
      text: 查看博客
      link: https://blog.52nyg.com

features:
  - title: 前去购买
    icon: 🛒
    details: 前往授权中心进行下载
    link: 'https://auth.xarr.cn'
    linkText: 立即前往
  - title: 个人版文档
    icon: 🛒
    details: 高清无码教程
    link: /person
    linkText: 立即查看
    
  - title: 商户版版文档
    icon: 🛒
    details: 高清无码教程
    link: /merchant
    linkText: 立即查看
  # - title: 个人版演示
  #   details: |
  #     点击跳转前台地址
  #     <br/>
  #     账号：usertest
  #     <br/>
  #     密码：123456
  #   link: 'https://pre-person.xarr.cn'
  # - title: 商户版演示
  #   details: | 
  #     点击跳转前台地址
  #     <br/>
  #     后台地址：/admin
  #     <br/>
  #     账号密码：admin
  #     <br/>
  #     前台账号：user
  #     <br/>
  #     前台密码：123456
      
  #   link: 'https://pre-merchant.xarr.cn/'
  
---
<style>
:root {
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  
    --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);

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
