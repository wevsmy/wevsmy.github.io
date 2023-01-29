---
title: docker使用squid搭建代理服务
aliases: [/2019/07/17/docker使用squid搭建代理服务/]
date: 2019-07-17 14:08:21
categories:
- 计算机
- Linux
- Docker
tags:
- Docker
- 笔记
- 代理
---

记录一下配置代理的过程。

<!--more-->

# docker使用squid搭建代理服务

## 记录一下

- docker-compose.yml

```yml
version: '3'

services:

  squid:
      image: sameersbn/squid:3.5.27-2
      ports:
	- "3128:3128"
      volumes:
	- /home/dev/srv/docker/squid/cache:/var/spool/squid
        - ./squid.conf:/etc/squid/squid.conf
      restart: always
```

- squid.conf

```txt
acl all src 0.0.0.0/0.0.0.0

acl SSL_ports port 443

acl Safe_ports port 80      # http

acl Safe_ports port 443     # https

acl CONNECT method CONNECT

http_access allow all

http_port 3128

visible_hostname proxy

```

- 使用

```
export ftp_proxy=http://10.10.192.18:3128
export http_proxy=http://10.10.192.18:3128
export https_proxy=http://10.10.192.18:3128
```

