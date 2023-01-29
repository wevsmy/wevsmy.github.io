---
title: "端口转发"
date: 2020-03-19T15:23:33+08:00
hidden: false
draft: false
tags: ["socat","linux","ssh","network",]
keywords: ["socat","linux","ssh","network",]
description: ""
slug: ""
---

利用`socat`进行端口转发 
<!--more-->

socat.sh
```bash
#!/bin/bash

DEF_REMOTE_HOST=127.0.0.1
DEF_REMOTE_PORT=80
DEF_LOCAL_PORT=80

REMOTE_HOST=$DEF_REMOTE_HOST
REMOTE_PORT=$DEF_REMOTE_PORT
LOCAL_PORT=$DEF_LOCAL_PORT

socat tcp-listen:$LOCAL_PORT,reuseaddr,fork tcp:$REMOTE_HOST:$REMOTE_PORT & pid=$! && trap "kill $pid" SIGINT && \
	echo "Socat started listening on $LOCAL_PORT: Redirecting traffic to $REMOTE_HOST:$REMOTE_PORT ($pid)" && wait $pid
```

docker-compose.yml
```yml
version: "3.7"
services:
  port-forward:
    image: marcnuri/port-forward:latest
    container_name: port-forward
    network_mode: host
    restart: always
    environment:
      REMOTE_HOST: 127.0.0.1
      REMOTE_PORT: 80
      LOCAL_PORT: 80
```

使用方式：
| Variable  | Description  | Optional  |  
|---|---|---|
|  DEF_/REMOTE_HOST |  IP or address of the host you want to forward traffic to | no  |  
|  DEF_/REMOTE_PORT |  Port on remote host to forward traffic to	 |  yes (80) |   
|  DEF_/LOCAL_PORT |  Port where container listens	 |  yes (80) |  


[参考链接](https://hub.docker.com/r/marcnuri/port-forward)