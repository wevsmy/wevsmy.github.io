---
title: docker安装宝塔管理面板
aliases: [/2019/03/12/docker安装宝塔管理面板/]
date: 2019-03-12 11:41:08
categories:
- 计算机
- Linux
- Docker
tags:
- Docker
- 笔记
---

拉取centos基础镜像，用容器启动该基础镜像，直接在容器中部署宝塔管理面板
<!--more-->
1.拉取纯净系统镜像
```
docker pull centos:7.2.1511
```
2.启动镜像，映射主机与容器内8888端口
```
docker run -d -it -p 8888:8888 centos:7.2.1511
```
如果映射多个端口
```
docker run -d -it -p 8888:8888 -p 80:80  centos:7.2.1511
```
一般我们再映射时候。都会把  8888  80 443  3306  21 等一些常用端口都映射过去。
注：`-p 80:80` 前面80是宿主机本机端口，后面的80是docker容器的。
3.`docker ps`查看容器id，并进入容器
```
docker exec -it 容器ID bash
```
4.执行宝塔面板Centos安装命令
```
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install.sh && sh install.sh
```