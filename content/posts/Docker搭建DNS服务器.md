---
title: "Docker搭建DNS服务器"
date: 2019-09-17T09:28:25+08:00
aliases:
- "/2019/09/17/docker_install_dnsmasq/"
hidden: false
draft: false
tags: 
- docker
- dns
- dnsmasq
keywords: 
- docker
- dns
- dnsmasq
- udp
- 53端口
categories: 
- docker
description: "docker环境搭建DNS服务器"
slug: ""
---

DNSmasq是一个小巧且方便地用于配置DNS和DHCP的工具。
用docker搭建一下用用。
<!--more-->

# Docker搭建DNS服务器

## 编写docker-compose.yml
```yml
version: '2'
services:
  dnsmasq:
    image: andyshinn/dnsmasq
    container_name: dnsmasq
    restart: always
    ports:
      - 53:53/tcp
      - 53:53/udp
    cap_add:
      - NET_ADMIN
    command: --log-facility=-
    volumes:
      - ./dnsmasq.d:/etc/dnsmasq.d
```
## 创建配置文件

### base.conf

路径`./dnsmasq.d/base.conf`
```txt
domain-needed
bogus-priv
no-hosts
keep-in-foreground
no-resolv
expand-hosts
server=114.114.114.114
server=10.10.192.1
server=10.10.10.1
```
### host.conf

路径`./dnsmasq.d/host.conf`
```txt
address=/test.local/192.168.1.1
address=/willson.wu/172.31.66.194
```

## 检查53端口
检查53端口是否被占用，要是被占用就干掉它，不然用不起来！
`sudo lsof -i:53`

## 启动&测试
启动 `docker-compose up -d`
测试 `dig test.local`