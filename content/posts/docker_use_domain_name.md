---
title: "配置nginx反向代理使Docker采用域名远程访问API"
date: 2019-09-12T10:00:57+08:00
hidden: false
draft: false
tags: [nginx,docker,proxy,domain]
keywords: [nginx,docker,proxy,domain,IDEA,nginx-proxy,sock,ssl]
description: "docker使用Nginx反向代理"
slug: ""
---

配置过docker开启2376采用远程访问，挺方便的，但是需要在服务器防火请放开2376端口（这是废话）
配置个nginx反向代理，直接采用域名443代理访问
<!--more-->

# 配置nginx反向代理使Docker采用域名远程访问
该方案实现的功能与[放开2376端口](https://blog.weii.ink/2019/09/11/docker_ca/)访问的效果是一毛一样的，区别在于使用代理

## 环境前期准备

### 环境
```txt
ubuntu 18.04
docker community 19.03
```
### 准备
- 预先生成CA证书
    - [自个写的生成记录](https://blog.weii.ink/2019/09/11/docker_ca/)
    - [官方Docker文档](https://docs.docker.com/engine/security/https/)
- 了解一下nginx-proxy的使用
    - [使用nginx-proxy代理](https://blog.weii.ink/2019/09/11/nginx_proxy-portainer/)
    - [官方nginx-proxy文档](https://hub.docker.com/r/jwilder/nginx-proxy)

## 概念
默认情况下，`docker`守护进程`dockerd`使用 `Unix socket（/var/run/docker.sock）`来进行本地进程通信，而不会监听任何端口。
如果想在其他主机上操作`docker主机`，就需要让`docker`守护进程`dockerd`打开一个`HTTP Socket`，这样才能实现远程通信。

在本地使用`docker ps`命令与` docker -H unix:///var/run/docker.sock ps`命令效果一样

```txt
ubuntu@VM-0-6-ubuntu:~$ docker ps
CONTAINER ID        IMAGE                        COMMAND                  CREATED             STATUS              PORTS                                      NAMES
6a60494e8756        jwilder/nginx-proxy:alpine   "/app/docker-entrypo…"   41 minutes ago      Up 41 minutes       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp   nginx-proxy
72d843c3164f        portainer/portainer          "/portainer -H unix:…"   21 hours ago        Up 17 hours         9000/tcp                                   portainer
ubuntu@VM-0-6-ubuntu:~$ docker -H unix:///var/run/docker.sock images
REPOSITORY            TAG                 IMAGE ID            CREATED             SIZE
jwilder/nginx-proxy   alpine              730317336993        2 days ago          54.4MB
portainer/portainer   latest              2b4ddf654e1c        6 weeks ago         77.7MB
ubuntu@VM-0-6-ubuntu:~$ 
```

在使用`nginx-proxy`项目中其，也是使用的`-v /var/run/docker.sock:/tmp/docker.sock:ro`
把本机的`docker.sock`挂载到容器内部使用
那么思路很清晰，在`nginx-proxy`容器中反向代理`/tmp/docker.sock`即可

## 配置
在`conf.d`下添加`docker.weii.ink.conf`配置
把证书文件放到`certs`中
路径是`nginx-proxy`容器中`conf.d`挂载的路径，[参考上篇文章ngixn-proxy配置](https://blog.weii.ink/2019/09/11/nginx_proxy-portainer/#%E5%88%9B%E5%BB%BA-docker-compose-yml-%E6%96%87%E4%BB%B6)
以下配置是俺的
```txt
ubuntu@VM-0-6-ubuntu:~/project/nginx-proxy/nginx/conf.d$ cat docker.weii.ink.conf 
upstream docker.weii.ink {
  ## Can be connected with "nginx_networks" network
  # docker
  server unix:///tmp/docker.sock;
}
server {
  server_name docker.weii.ink;
  listen 80 ;
  access_log /var/log/nginx/access.log vhost;
  return 301 https://$server_name$request_uri;
}
server {
  server_name docker.weii.ink;
  listen 443 ssl http2 ;
  access_log /var/log/nginx/access.log vhost;
  
  ssl_certificate      /etc/nginx/certs/docker-server-cert.pem;
  ssl_certificate_key  /etc/nginx/certs/docker-server-key.pem;
  ssl_client_certificate /etc/nginx/certs/docker-ca.pem;
  ssl_verify_client on;

  ssl_session_timeout 5m;
  ssl_session_cache shared:SSL:50m;
  ssl_session_tickets off;
  add_header Strict-Transport-Security "max-age=31536000" always;

  location / {
      proxy_pass http://docker.weii.ink;
  }
} 
ubuntu@VM-0-6-ubuntu:~/project/nginx-proxy/nginx/conf.d$ 
```
然后重启`nginx-proxy`就成了
注：
`nginx`日志如果提示对`unix:///tmp/docker.sock`没有权限
那就开放权限`docker exec -it nginx-proxy chmod 777 /tmp/docker.sock`

## 验证
```txt
ubuntu@VM-0-6-ubuntu:~/project/CA/Client$ curl https://docker.weii.ink/images/json --cert cert.pem --key key.pem --cacert ca.pem
[{"Containers":-1,"Created":1568041593,"Id":"sha256:73031733699358abfc15a2953e496e0edddb127123e51a099aa953391c6db542","Labels":{"maintainer":"Jason Wilder mail@jasonwilder.com"},"ParentId":"","RepoDigests":["jwilder/nginx-proxy@sha256:07c0e9866ce0e974b92173542ebdaa2dc03315ec8269e0718dcca5bb3450a430"],"RepoTags":["jwilder/nginx-proxy:alpine"],"SharedSize":-1,"Size":54365911,"VirtualSize":54365911},{"Containers":-1,"Created":1564107108,"Id":"sha256:2b4ddf654e1c413b21c7253125aa0f34a4ff74154558940fa689f8754ec853c5","Labels":null,"ParentId":"","RepoDigests":["portainer/portainer@sha256:a16919b3e02323e4bd0a8c5023d6fd569525297b9dc9a028d778cb6e13512be5"],"RepoTags":["portainer/portainer:latest"],"SharedSize":-1,"Size":77680455,"VirtualSize":77680455}]
ubuntu@VM-0-6-ubuntu:~/project/CA/Client$ docker images
REPOSITORY            TAG                 IMAGE ID            CREATED             SIZE
jwilder/nginx-proxy   alpine              730317336993        2 days ago          54.4MB
portainer/portainer   latest              2b4ddf654e1c        6 weeks ago         77.7MB
```

后续就可以直接用`IDEA`链接远程`docker`进行开发了