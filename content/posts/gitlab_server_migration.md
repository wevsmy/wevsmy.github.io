---
title: Gitlab服务器迁移
aliases: [/2019/07/15/gitlab服务器迁移/]
date: 2019-07-15 17:37:26
categories:
- 计算机
- Linux
- Docker
tags:
- Docker
- 笔记
---

公司有需求安装在172.31.66.63的gitlab服务需要迁移到10.10.192.18上，记录一下迁移过程。

<!--more-->

# 安装docker环境

新机器CentOS安装docker环境

- 清理自带的docker

```shell
sudo yum remove docker \
docker-client \
docker-client-latest \
docker-common \
docker-latest \
docker-latest-logrotate \
docker-logrotate \
docker-engine
```

- 安装依赖

```shell
sudo yum install -y yum-utils \
device-mapper-persistent-data \
lvm2
```

- 添加仓库

```shell
sudo yum-config-manager \
--add-repo \
https://download.docker.com/linux/centos/docker-ce.repo
```

- 安装docker-ce

```shell
sudo yum install docker-ce docker-ce-cli containerd.io
```

- 安装docker-compose

```shell
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

```shell
sudo chmod +x /usr/local/bin/docker-compose
```

# 迁移gitlab

把gitlab的数据迁移到新的机器中`/srv/docker/gitlab`

`scp -r 目录名 用户名@计算机IP或者计算机名称:远程路径`

# 备份

`bundle exec bin/rake gitlab:backup:create RAILS_ENV=production`

# 恢复备份

`bundle exec bin/rake gitlab:backup:restore RAILS_ENV=production BACKUP=1563163325_2019_07_15_11.1.4`



##  docker-compose文件
```yml
version: '2'

services:
  redis:
    restart: always
    image: sameersbn/redis:4.0.9-2
    command:
    - --loglevel warning
    volumes:
    - /srv/docker/gitlab/redis:/var/lib/redis

  postgresql:
    restart: always
    image: sameersbn/postgresql:10-2
    volumes:
    - /srv/docker/gitlab/postgresql:/var/lib/postgresql
    environment:
    - DB_USER=gitlab
    - DB_PASS=password
    - DB_NAME=gitlabhq_production
    - DB_EXTENSION=pg_trgm

  gitlab:
    restart: always
    image: sameersbn/gitlab:12.0.0
    depends_on:
    - redis
    - postgresql
    ports:
    - "80:80"
    - "10022:22"
    volumes:
    - /srv/docker/gitlab/gitlab:/home/git/data
    environment:
    - DEBUG=false
    - DB_ADAPTER=postgresql
    - DB_HOST=postgresql
    - DB_PORT=5432
    - DB_USER=gitlab
    - DB_PASS=password
    - DB_NAME=gitlabhq_production

    - REDIS_HOST=redis
    - REDIS_PORT=6379

    - TZ=UTC
    - GITLAB_TIMEZONE=UTC

    - GITLAB_HTTPS=false
    - SSL_SELF_SIGNED=false

    - GITLAB_HOST=10.10.192.18
    - GITLAB_PORT=80
    - GITLAB_SSH_PORT=10022
    - GITLAB_RELATIVE_URL_ROOT=
    - GITLAB_SECRETS_DB_KEY_BASE=9LMMzdfMCTwmmJLcq37kThXbv4xPrMCmWpmqcKxgTnvhg3VRVF4PTXXmXvv7twfr
    - GITLAB_SECRETS_SECRET_KEY_BASE=w9stWVkKTsj3qcPcV4vrCWhcmbrMm9W9fVvLKfV9NvgqXJwf9XKpbb43h4KnHsxR
    - GITLAB_SECRETS_OTP_KEY_BASE=KWFp9CgzRwWLFPKMTgHfwK4mVWtLTcFssw3JbnzkRHpPzcVWwFTww4wkzTxxvLwb

    - GITLAB_ROOT_PASSWORD=
    - GITLAB_ROOT_EMAIL=willson.wu@goertek.com

    - GITLAB_NOTIFY_ON_BROKEN_BUILDS=true
    - GITLAB_NOTIFY_PUSHER=false

    - GITLAB_EMAIL=willson.wu@goertek.com
    - GITLAB_EMAIL_REPLY_TO=willson.wu@goertek.com
    - GITLAB_INCOMING_EMAIL_ADDRESS=willson.wu@goertek.com

    - GITLAB_BACKUP_SCHEDULE=daily
    - GITLAB_BACKUP_TIME=04:00

    - SMTP_ENABLED=true
    - SMTP_DOMAIN=www.goertek.com
    - SMTP_HOST=smtp.goertek.com
    - SMTP_PORT=465
    - SMTP_USER=willson.wu@goertek.com
    - SMTP_PASS=xxxxxxx
    - SMTP_STARTTLS=false
    - SMTP_TLS=true
    - SMTP_AUTHENTICATION=login

    - IMAP_ENABLED=false
    - IMAP_HOST=imap.gmail.com
    - IMAP_PORT=993
    - IMAP_USER=mailer@example.com
    - IMAP_PASS=password
    - IMAP_SSL=true
    - IMAP_STARTTLS=false

    - OAUTH_ENABLED=false
    - OAUTH_AUTO_SIGN_IN_WITH_PROVIDER=
    - OAUTH_ALLOW_SSO=
    - OAUTH_BLOCK_AUTO_CREATED_USERS=true
    - OAUTH_AUTO_LINK_LDAP_USER=false
    - OAUTH_AUTO_LINK_SAML_USER=false
    - OAUTH_EXTERNAL_PROVIDERS=

    - OAUTH_CAS3_LABEL=cas3
    - OAUTH_CAS3_SERVER=
    - OAUTH_CAS3_DISABLE_SSL_VERIFICATION=false
    - OAUTH_CAS3_LOGIN_URL=/cas/login
    - OAUTH_CAS3_VALIDATE_URL=/cas/p3/serviceValidate
    - OAUTH_CAS3_LOGOUT_URL=/cas/logout

    - OAUTH_GOOGLE_API_KEY=
    - OAUTH_GOOGLE_APP_SECRET=
    - OAUTH_GOOGLE_RESTRICT_DOMAIN=

    - OAUTH_FACEBOOK_API_KEY=
    - OAUTH_FACEBOOK_APP_SECRET=

    - OAUTH_TWITTER_API_KEY=
    - OAUTH_TWITTER_APP_SECRET=

    - OAUTH_GITHUB_API_KEY=
    - OAUTH_GITHUB_APP_SECRET=
    - OAUTH_GITHUB_URL=
    - OAUTH_GITHUB_VERIFY_SSL=

    - OAUTH_GITLAB_API_KEY=
    - OAUTH_GITLAB_APP_SECRET=

    - OAUTH_BITBUCKET_API_KEY=
    - OAUTH_BITBUCKET_APP_SECRET=

    - OAUTH_SAML_ASSERTION_CONSUMER_SERVICE_URL=
    - OAUTH_SAML_IDP_CERT_FINGERPRINT=
    - OAUTH_SAML_IDP_SSO_TARGET_URL=
    - OAUTH_SAML_ISSUER=
    - OAUTH_SAML_LABEL="Our SAML Provider"
    - OAUTH_SAML_NAME_IDENTIFIER_FORMAT=urn:oasis:names:tc:SAML:2.0:nameid-format:transient
    - OAUTH_SAML_GROUPS_ATTRIBUTE=
    - OAUTH_SAML_EXTERNAL_GROUPS=
    - OAUTH_SAML_ATTRIBUTE_STATEMENTS_EMAIL=
    - OAUTH_SAML_ATTRIBUTE_STATEMENTS_NAME=
    - OAUTH_SAML_ATTRIBUTE_STATEMENTS_FIRST_NAME=
    - OAUTH_SAML_ATTRIBUTE_STATEMENTS_LAST_NAME=

    - OAUTH_CROWD_SERVER_URL=
    - OAUTH_CROWD_APP_NAME=
    - OAUTH_CROWD_APP_PASSWORD=

    - OAUTH_AUTH0_CLIENT_ID=
    - OAUTH_AUTH0_CLIENT_SECRET=
    - OAUTH_AUTH0_DOMAIN=

    - OAUTH_AZURE_API_KEY=
    - OAUTH_AZURE_API_SECRET=
    - OAUTH_AZURE_TENANT_ID=

    - NGINX_WORKERS=4
    #- GITLAB_MATTERMOST_ENABLED=true
    #- GITLAB_MATTERMOST_URL="http://10.10.192.18:10080/"
```
