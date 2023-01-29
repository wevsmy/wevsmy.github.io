---
title: docker修改默认网段
aliases: [/2019/07/17/docker修改默认网段/]
date: 2019-07-17 12:37:11
categories:
- 计算机
- Linux
- Docker
tags:
- Docker
- 笔记
- Network
---

docker-compose 启动的网桥使用的网段与公司172.31.xx.xx网段冲突

<!--more-->

# docker使用docker-compose造成网段冲突

## 现象

docker-compose每次创建新的网桥的时候，还是使用默认的172.xx.xx.xx
在使用docker-compose启动服务其，创建了一个172.31.0.1的网桥，你说巧不巧，恰好公司使用的网络网段为172.31.66.xx所以使用172.31.xx.xx的网络，访问不了，哭死，咋办，不能改公司网络，只能修改docker网络配置了

## 需求

**只需修改一个地方，然后docker-compose up创建新网桥的时候就会使用我们设置的那个网段和子网；像修改docker0的网段一样，修改/etc/docker/daemon.json配置文件，docker0的网段就会变为在daemon.json里设置的这个；有没有类似于只要修改一个配置文件，docker-compose每次创建新的网桥的时候都会按照配置文件里的来**

## 解决方案

在`/etc/docker/daemon.json`添加

```json
{
"debug" : true,
"default-address-pools" : [
    {
      "base" : "12.11.0.0/16",
      "size" : 24
    }
  ] 
}
```

然后重启`docker`服务

```shell
service docker restart
```

**亲测可以使用**

