---
title: "go代理设置"
date: 2019-10-09T10:47:49+08:00
hidden: false
draft: false
tags: [go,proxy,golang]
keywords: [go,proxy,golang,goproxy]
description: "go代理设置"
slug: ""
---

由于国内墙的存在go get经常失败，记录安装依赖时go代理设置
<!--more-->

# go代理设置

在`Go 1.13`中，我们可以通过`GOPROXY`来控制代理，以及通过`GOPRIVATE`控制私有库不走代理

## GOPROXY

国内常用代理
```txt
https://goproxy.cn
https://goproxy.io
https://mirrors.aliyun.com/goproxy/
```

设置GOPROXY代理
```bash
go env -w GOPROXY=https://goproxy.cn,direct
```

## GOPRIVATE

设置`GOPRIVATE`来跳过私有库，比如常用的`Gitlab`或`Gitee`，中间使用逗号分隔：
```bash
go env -w GOPRIVATE=*.gitlab.com,*.gitee.com
```

## GOSUMDB

如果在运行`go mod vendor`时，提示:
`Get https://sum.golang.org/lookup/xxxxxx: dial tcp 216.58.200.49:443: i/o timeout`
则是因为`Go 1.13`设置了默认的`GOSUMDB=sum.golang.org`，这个网站是被墙了的，用于验证包的有效性，可以通过如下命令关闭：
```bash
go env -w GOSUMDB=off
```
可以设置`GOSUMDB="sum.golang.google.cn"`， 这个是专门为国内提供的`sum`验证服务。
```bash
go env -w GOSUMDB="sum.golang.google.cn"
```