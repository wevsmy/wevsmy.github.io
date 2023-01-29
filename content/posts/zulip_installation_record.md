---
title: zulip安装记录
aliases: [/2019/06/18/zulip安装记录/]
date: 2019-06-18 17:14:36
categories:
- 计算机
- Linux
- Docker
tags:
- Python
- Docker
- Zulip
- 笔记
---

在公司内网搭建个聊天服务，专门用来唠嗑，吹牛逼。为啥不用公司内网的通讯工具？俺又不傻，万一被公司逮到在上班时间闲聊，其实也没事哈。主要还是想搞点东西练手☺简单记录一下采用Docker安装Zulip的过程

<!--more-->

Zulip的docker镜像在国外比较慢，我才用的是自己阿里云的镜像加速。

修改docker-compose.yml文件，其中由个别需要记录的。

就拿邮箱配置吧，由于公司邮箱对随机token的名字的邮箱会识别为垃圾邮件。

```yml
version: '2'
services:

  database:
    image: 'zulip/zulip-postgresql'
    environment:
      POSTGRES_DB: 'zulip'
      POSTGRES_USER: 'zulip'
      # Note that you need to do a manual `ALTER ROLE` query if you
      # change this on a system after booting the postgres container
      # the first time on a host.  Instructions are available in README.md.
      POSTGRES_PASSWORD: 'REPLACE_WITH_SECURE_POSTGRES_PASSWORD'
    volumes:
      - '/opt/docker/zulip/postgresql/data:/var/lib/postgresql/data:rw'

  memcached:
    image: 'quay.io/sameersbn/memcached:latest'
    restart: always

  rabbitmq:
    image: 'rabbitmq:3.7.7'
    hostname: zulip-rabbit
    restart: always
    environment:
      RABBITMQ_DEFAULT_USER: 'zulip'
      RABBITMQ_DEFAULT_PASS: 'REPLACE_WITH_SECURE_RABBITMQ_PASSWORD'
    volumes:
      - '/opt/docker/zulip/rabbitmq:/var/lib/rabbitmq:rw'

  redis:
    image: 'quay.io/sameersbn/redis:latest'
    volumes:
      - '/opt/docker/zulip/redis:/var/lib/redis:rw'

  zulip:
    image: 'zulip/docker-zulip:2.0.4-0'

    ports:
      - '80:80'
      - '443:443'
    environment:
      DB_HOST: 'database'
      DB_HOST_PORT: '5432'
      DB_USER: 'zulip'
      SSL_CERTIFICATE_GENERATION: 'self-signed'
      SETTING_MEMCACHED_LOCATION: 'memcached:11211'
      SETTING_RABBITMQ_HOST: 'rabbitmq'
      SETTING_REDIS_HOST: 'redis'
      # 这是邮件的密码，用来配置SMTP的，所以邮箱需要打开SMTP支持
      SECRETS_email_password: 'xxxxxx'
      # These should match POSTGRES_PASSWORD and RABBITMQ_DEFAULT_PASS.
      SECRETS_rabbitmq_password: 'REPLACE_WITH_SECURE_RABBITMQ_PASSWORD'
      SECRETS_postgres_password: 'REPLACE_WITH_SECURE_POSTGRES_PASSWORD'
      SECRETS_secret_key: 'REPLACE_WITH_SECURE_SECRET_KEY'
      SETTING_EXTERNAL_HOST: '172.31.66.194'
      SETTING_ZULIP_ADMINISTRATOR: 'willson.wu@goertek.com'
      # 公司的DNS服务器经常性的被污染，直接用IP访问
      SETTING_EMAIL_HOST: '123.133.65.6'  # e.g. smtp.example.com
      SETTING_EMAIL_HOST_USER: 'willson.wu@goertek.com'
      SETTING_EMAIL_PORT: '25'
      # It seems that the email server needs to use ssl or tls and can't be used without it
      # 公司邮箱支持SSL，但是使用SSL需要用域名，直接不用也没有事，反正是公司内网
      SETTING_EMAIL_USE_SSL: 'False'
      SETTING_EMAIL_USE_TLS: 'False'
      # 下面这两个配置，小坑了一下，由于公司邮箱对垃圾邮件的拦截策略，所以需要把随机发送的邮箱名字给禁掉，并且固化为自己固定的邮箱。
      SETTING_ADD_TOKENS_TO_NOREPLY_ADDRESS: 'False'
      SETTING_NOREPLY_EMAIL_ADDRESS: 'willson.wu@goertek.com'

      ZULIP_AUTH_BACKENDS: 'EmailAuthBackend'
      # Uncomment this when configuring the mobile push notifications service
      # SETTING_PUSH_NOTIFICATION_BOUNCER_URL: 'https://push.zulipchat.com'
    volumes:
      - '/opt/docker/zulip/zulip:/data:rw'
    ulimits:
      nofile:
        soft: 40000
        hard: 50000

```

