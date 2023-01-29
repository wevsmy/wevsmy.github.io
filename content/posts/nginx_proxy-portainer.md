---
title: "portainer使用nginx-proxy配置代理添加证书"
date: 2019-09-11T13:31:41+08:00
hidden: false
draft: false
tags: [portainer,nginx,docker,proxy]
keywords: [portainer,nginx,docker,proxy,nginx-proxy,ssl,https]
description: "portainer使用nginx-proxy配置代理添加证书"
slug: ""
---

nginx-proxy设置一个运行nginx和docker-gen的容器。docker-gen为nginx生成反向代理配置，并在启动和停止容器时重新加载nginx。
使用nginx-proxy来反向代理portainer，并且使用`https`域名加密访问。
<!--more-->

# portainer使用nginx-proxy配置代理添加证书

## 创建一个bridge网络
```bash
docker network create nginx_networks
```
验证:
```txt
ubuntu@VM-0-6-ubuntu:~/project$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
0ebf5e273b13        bridge              bridge              local
fd601333f19e        host                host                local
c0dbfc8d59a8        nginx_networks      bridge              local
6e07cf9aa154        none                null                local
```

## nginx-proxy配置
采用`docker-compose`项目进行服务编排

### 创建项目文件夹
```bash
mkdir nginx-proxy
cd nginx-proxy 
```
### 创建项目文件
```yml
version: '3'
services:
  nginx-proxy:
    image: jwilder/nginx-proxy:alpine
    container_name: nginx-proxy
    restart: always
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./nginx/log:/var/log/nginx
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/certs:/etc/nginx/certs
      - /var/run/docker.sock:/tmp/docker.sock:ro
    networks:
      - nginx_networks
  whoami:
    image: jwilder/whoami
    environment:
      - VIRTUAL_HOST=whoami.local
    networks:
      - nginx_networks
networks:
  nginx_networks:
    external: true
```
注：
- `networks`加入上一步已经创建好的网络中
- `whoami`用来测试
- `volumes`挂载相应的数据
    - `log`把日志挂出来
    - `conf.d`便于自定义
    - `certs`配置SSL证书
    - *`docker.sock`*主要用于监听`docker`容器为`nginx`生成反向代理配置，并在启动和停止容器时重新加载`nginx`。
### 启动项目容器
```bash
docker-compose up -d
```
### 验证
```txt
ubuntu@VM-0-6-ubuntu:~/project/nginx-proxy$ curl -H "Host: whoami.local" localhost
I'm eb5b18a676c8
```
会输出`jwilder/whoami`的容器`ID`

## portainer配置
同样是采用`docker-compose`项目进行服务编排

### 创建项目文件夹
```bash
cd ..
mkdir portainer
cd portainer
```

### 创建项目文件
```yml
version: '3'
services:
  portainer:
    image: portainer/portainer
    container_name: portainer
    restart: always
    command: -H unix:///var/run/docker.sock
    environment:
      - VIRTUAL_HOST=portainer.weii.ink
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - nginx_networks
volumes:
  portainer_data:
networks:
  nginx_networks:
    external: true
```
注：
- `networks`与`nginx-proxy`加入同一个网络中
- `volumes`存放`portainer`数据
- `environment`环境变量配置`portainer`容器使用的域名，这个变量是`nginx-proxy`使用的

### 启动
```bash
docker-compose up -d
```
然后就可以用`http://portainer.weii.ink`访问啦！

## 启用证书加密

### 申请免费的域名证书
- 我已经申请过了...不在说了
- 证书文件命名为`portainer.weii.ink.crt`和`portainer.weii.ink.key`
- 证书文件放到`nginx-proxy/nginx/certs`路径下
- 重启`nginx-proxy`
### 验证
```
ubuntu@VM-0-6-ubuntu:~/project/nginx-proxy$ docker exec -it nginx-proxy cat /etc/nginx/conf.d/default.conf
# If we receive X-Forwarded-Proto, pass it through; otherwise, pass along the
# scheme used to connect to this server
map $http_x_forwarded_proto $proxy_x_forwarded_proto {
  default $http_x_forwarded_proto;
  ''      $scheme;
}
# If we receive X-Forwarded-Port, pass it through; otherwise, pass along the
# server port the client connected to
map $http_x_forwarded_port $proxy_x_forwarded_port {
  default $http_x_forwarded_port;
  ''      $server_port;
}
# If we receive Upgrade, set Connection to "upgrade"; otherwise, delete any
# Connection header that may have been passed to this server
map $http_upgrade $proxy_connection {
  default upgrade;
  '' close;
}
# Apply fix for very long server names
server_names_hash_bucket_size 128;
# Default dhparam
ssl_dhparam /etc/nginx/dhparam/dhparam.pem;
# Set appropriate X-Forwarded-Ssl header
map $scheme $proxy_x_forwarded_ssl {
  default off;
  https on;
}
gzip_types text/plain text/css application/javascript application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
log_format vhost '$host $remote_addr - $remote_user [$time_local] '
                 '"$request" $status $body_bytes_sent '
                 '"$http_referer" "$http_user_agent"';
access_log off;
		ssl_protocols TLSv1.2 TLSv1.3;
		ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
		ssl_prefer_server_ciphers off;
resolver 127.0.0.11;
# HTTP 1.1 support
proxy_http_version 1.1;
proxy_buffering off;
proxy_set_header Host $http_host;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $proxy_connection;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $proxy_x_forwarded_proto;
proxy_set_header X-Forwarded-Ssl $proxy_x_forwarded_ssl;
proxy_set_header X-Forwarded-Port $proxy_x_forwarded_port;
# Mitigate httpoxy attack (see README for details)
proxy_set_header Proxy "";
server {
	server_name _; # This is just an invalid value which will never trigger on a real hostname.
	listen 80;
	access_log /var/log/nginx/access.log vhost;
	return 503;
}
# portainer.weii.ink
upstream portainer.weii.ink {
				## Can be connected with "nginx_networks" network
			# portainer
			server 192.168.0.2:9000;
}
server {
	server_name portainer.weii.ink;
	listen 80 ;
	access_log /var/log/nginx/access.log vhost;
	return 301 https://$host$request_uri;
}
server {
	server_name portainer.weii.ink;
	listen 443 ssl http2 ;
	access_log /var/log/nginx/access.log vhost;
	ssl_session_timeout 5m;
	ssl_session_cache shared:SSL:50m;
	ssl_session_tickets off;
	ssl_certificate /etc/nginx/certs/portainer.weii.ink.crt;
	ssl_certificate_key /etc/nginx/certs/portainer.weii.ink.key;
	add_header Strict-Transport-Security "max-age=31536000" always;
	location / {
		proxy_pass http://portainer.weii.ink;
	}
}
# whoami.local
upstream whoami.local {
				## Can be connected with "nginx_networks" network
			# nginx-proxy_whoami_1
			server 192.168.0.4:8000;
}
server {
	server_name whoami.local;
	listen 80 ;
	access_log /var/log/nginx/access.log vhost;
	location / {
		proxy_pass http://whoami.local;
	}
}
ubuntu@VM-0-6-ubuntu:~/project/nginx-proxy$ 
```
`nginx-proxy`已经自动配置好代理，以及SSL证书

## 最后
访问`https://portainer.weii.ink`就会有SSL证书啦！

## 参考链接
[nginx-proxy](https://hub.docker.com/r/jwilder/nginx-proxy)

