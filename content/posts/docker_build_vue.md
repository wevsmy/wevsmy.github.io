---
title: 编写Dockerfile分阶段构建Vue项目
aliases: [/2019/07/15/docker-build-vue/]
date: 2019-07-15 09:37:26
categories:
- 计算机
- Linux
- Docker
tags:
- Docker
- 笔记
---

docker构建部署vue项目，减少构建后的docker镜像的大小，采用分阶段构建，只保留build

<!--more-->

```Dockerfile
# 第一阶段,拉取node基础镜像并安装依赖,执行构建
FROM node:latest as builder
# 标签
LABEL maintainer="<willson.wu@goertek.com>"
# 参数
ARG WEB_GIT_URL=http://willson.wu:12345678@10.10.192.18/cep/BigData/energy-web.git
# npm源 淘宝源
ARG NPM_REGISTRY=https://registry.npm.taobao.org
# APT换源加速 阿里源
COPY .docker/conf/sources.list /etc/apt
# 更新并安装git
RUN apt-get -q update && \
    apt-get -q install -y git
# 拉取代码
RUN git clone "$WEB_GIT_URL"
# 设置工作目录
WORKDIR /energy-web
# 换源加速并安装项目依赖
RUN npm install chromedriver --chromedriver_cdnurl=http://cdn.npm.taobao.org/dist/chromedriver && \
npm config set registry "$NPM_REGISTRY" && \
npm install && \
npm rebuild node-sass
# 构建项目
RUN npm run build --scripts-prepend-node-path=auto
# 第二阶段,将构建完的产物dist文件夹COPY到实际release的镜像中,并会丢弃第一阶段中其他的文件
FROM nginx:latest
# copy nginx配置
COPY .docker/conf/default.conf /etc/nginx/conf.d
# copy 项目编译生成文件
COPY --from=builder /energy-web/dist /usr/share/nginx/html
# 暴露端口
EXPOSE 8080
```


