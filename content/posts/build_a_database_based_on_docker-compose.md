---
title: 基于docker-compose构建数据库
aliases: [/2019/02/19/基于docker-compose构建数据库/]
date: 2019-02-19 11:38:46
categories:
- 计算机
- Linux
- Docker
tags:
- Docker
- 笔记
---

在开发的过程中免不了要使用数据库。使用docker构建一些常用的数据库免去安装的繁琐。

<!--more-->

# 序🤫

使用docker构建mysql、mongo、redis、postgresql、sqlserver数据库，可以直接使用，免去安装的繁琐。

## mysql

```yaml
version: '3.1'
services:
  mysql:
    image: mysql:5.7
    container_name: mysql
    restart: always
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: willson
      MYSQL_DATABASE: willson
      MYSQL_USER: willson
      MYSQL_PASSWORD: willson
    volumes:
      - "/mnt/data2/database/mysql:/var/lib/mysql"
```

## mongo

mongo默认只能本机访问，开启外网访问必须添加`command: ["mongod","--bind_ip","0.0.0.0"]`

```yaml
version: '3.1'
services:
  mongo:
    image: mongo:4.0.4
    container_name: mongo
    restart: always
    ports:
      - 27017:27017
    #    environment:
    #      MONGO_INITDB_ROOT_USERNAME: root
    #      MONGO_INITDB_ROOT_PASSWORD: root
    #      MONGO_INITDB_DATABASE_NAME: test
    command: ["mongod","--bind_ip","0.0.0.0"]
    volumes:
      - "/mnt/data2/database/mongodb:/data/db"
```

## redis

参数`--bind 0.0.0.0`开启外部访问
参数`--appendonly yes` 开启持久化

```yaml
version: '3.1'
services:
  image: redis:alpine
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    command: ["redis-server","--bind","0.0.0.0","--appendonly","yes"]
    volumes:
      - "/mnt/data2/database/redis:/data"
```

## postgresql

使用ubuntu系统，其启动`postgresql`有个小坑。
在`postgresql`的`volumes`只能映射在本机系统文件夹下，不能映射到系统外置挂载的磁盘中。不然容器跑不起来。😥

```yaml
version: '3.1'
services:
  image: postgres
    container_name: postgresql
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root
      POSTGRES_DB: test
    volumes:
      - '/opt/docker/database/postgresql/data:/var/lib/postgresql/data:rw'
```

## sqlServer

其中参数`MSSQL_SA_PASSWORD`的密码必须为8位不同的、高强度的，不然容器跑不起来。🤦‍

```yaml
version: '3.1'
services:
  sqlServer:
    image: mcr.microsoft.com/mssql/server:2017-latest
    container_name: sqlServer
    restart: always
    ports:
      - "1433:1433"
    environment:
      ACCEPT_EULA: Y
      MSSQL_SA_PASSWORD: 123qwe!@#
#      MSSQL_PID: Express
```