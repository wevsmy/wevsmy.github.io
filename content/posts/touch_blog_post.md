---
title: 一键创建blog文
aliases: [/2018/06/04/一键创建blog文/]
date: 2018-06-04 16:57:52
categories:
- 计算机
- Win10
tags:
- 教程
- hexo
---
# 前言
使用hexo搭建静态博客确实方便,页面托管到github pages上
写博客只需编写md文件即可,markdown语法简单,使用方便
原来也用过wordpress建博客,也挺好的,相比较下hexo比wordpress要轻便
<!--more-->
# 使用hexo优点
- 熟练git使用方法
- 掌握markdown语法
- GitHub pages托管静态页面
- 可以加入最大同性交友社区(误)
---
# hexo使用
hexo具体安装自己google

生成页面
```
hexo g
```
创建博文
```
hexo n 博文名
```
发布博文
```
hexo d
```
# 改进创建博文的不便捷
创建博文需要到blog根目录打开powershell 运行
```
hexo n name
```
然后需要到_posts目录下打开刚才创建的name.md 进行编写博文
个人觉得比较繁琐,就想着改进一下
## 一键创建blog文原理
就是把几个命令组合到一起,很简单
比如我的:
```
cd D:\python\WilsonBlog | hexo n {query} | notepad++.exe D:\python\WilsonBlog\source\_posts\{query}.md
```
- 先cd到博客目录
- 运行hexo n name 创建博文
- 调用notepad++打开刚创建的博文
这样就能在任何地方打开powershell就能创建博文了
但是这个还不够好,因为还需要手敲命令,麻烦!
## 在改进一下
个人非常喜欢使用listary这个快速搜索工具
其支持自定义命令,每次启动只需双击ctrl就可以
具体如下图所示:
![我的自定义命令](/static/posts/touch_blog_post/82574636.jpg)
这样在任何地方只需双击ctrl键输入关键字blog 博文名 即可创建博文
# 实现效果
![gif](/static/posts/touch_blog_post/46250370.jpg)