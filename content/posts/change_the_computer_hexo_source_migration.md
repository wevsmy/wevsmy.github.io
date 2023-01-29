---
title: 换电脑hexo源码迁移
aliases: [/2019/02/19/换电脑hexo源码迁移/]
date: 2019-01-15 10:08:43
categories:
- 笔记

tags:
- 教程
- hexo
---
更换电脑后迁移hexo源代码😂
<!--more-->
# 备份必要文件
进入原来电脑的 hexo 博客目录，只拷如下几个目录：
```text
scaffolds            文章模版                          必须备份
source               博客文章                          必须备份
themes               主题                             必须备份
.gitignore           限定在push时那些文件可以忽略         必须备份
_config.yml          站点配置文件                       必须备份
package.json         安装包的名称                       必须备份

.ssh                 密钥文件                          必须备份
```
`ps:上面的文件可以存U盘或者打包上传到xx网盘。`

# 安装配置 Hexo

用之前的套路安装 Node.js 环境  Git 环境
- 打开 开始菜单 运行 cmd
- 新建 blog 文件夹
`md d:\blog`
- 进入 blog 文件夹
`cd blog`
- 安装 Hexo
`npm install -g hexo`
- 初始化 Hexo
`hexo init`
- 安装依赖包
`npm install`

上面的命令执行完了，你的博客目录会生成新的 hexo 博客文件，我们把刚才拷贝过来的文件，替换掉新生成的 博客文件，然后在复制 密钥文件 到新的密钥文件夹
在blog文件夹中打开 `Git Bash Here`
- 初始化git本地仓库
`git init`
- 安装上传插件
`npm install hexo-deployer-git --save`
- RSS插件
`npm install hexo-generator-feed`
- 字数统计 阅读时长 插件
`npm i --save hexo-wordcount`
- 搜索插件
`npm install hexo-generator-searchdb --save`
如果你使用了更多的插件，在这里安装就可以了。
配置Git 输入你自己的邮箱地址
```text
git config --global user.name
git config --global user.email
```
- 生成新的 public 文件夹
`hexo g`
- 开始上传 hexo博客
`hexo d`

---
date: 2019-05-31 09:41:53

采用Onedrive备份hexo博客源码

- 备份文件

  简单方便，只要把blog文件目录放到Onedrive中，其会自动备份的。新电脑登录Onedrive拉取blog文件。

- 安装环境

  - 安装node.js
  - 安装hexo `npm install -g hexo`
  - 预览blog `hexo s`
  - 生成blog `hexo g`
  - 上传blog `hexo d`
  - 搞定收工😁