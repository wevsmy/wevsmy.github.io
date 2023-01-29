---
title: 使用docker搭建smtp服务
aliases: [/2019/08/31/使用docker搭建smtp服务/]
date: 2019-08-31 10:31:11
categories:
- 计算机
- Linux
- Docker
tags:
- SMTP
- Docker
- 订阅
---

前段时间搭建gitlab服务harbor仓库，需要用到SMTP服务用于发送邮件，用的自己办公邮箱做的测试，给别人自动发的邮件显示的是自己的邮箱。。。不正规😋申请公司的公共邮箱流程太繁琐了😥 还是自己搭建一个SMTP服务吧，自己动手丰衣足食。

<!--more-->

# docker使用SMTP搭建邮件发送服务

## 下载镜像
```shell
docker pull namshi/smtp
```

## 服务编排

采用`docker-compose`进行服务编排
启动`docker-compose up -d` or `docker-compose -f docker-compose.yml up -d`

### 文件结构
```shell
.
├── conf
│   ├── hosts
│   └── resolv.conf
├── docker-compose.yml
├── README.md
└── smtp.py

1 directory, 5 files
```

### docker-compose.yml
```yml
version: '3'
services:
  SMTP:
    image: namshi/smtp
    container_name: SMTP
    restart: always
    ports:
      - "10025:25"
    environment:
      RELAY_NETWORKS: :0.0.0.0/0
    volumes:
      - ./conf/hosts:/etc/hosts
	  - ./conf/resolv.conf:/etc/resolv.conf
```
- 1.用为没有加密，所有就把默认的25端口给换个端口映射到宿主机，再说反正是公司内网环境。。。😎
- 2.RELAY_NETWORKS这个环境变量的作用是负责发件请求的拦截，当设置为“:0.0.0.0/0”时表示任意客户端皆可发起发件请求😁
- 3.指定主机域，不然发送出去的邮件，发件人为`Mail Delivery System <Mailer-Daemon@c4de06bf41e5>`，添加主机名后就可以伪造发件人啦🤔  
	<img src="/static/posts/docker_install_smtp_server/1565665933.png" alt="没加hosts发送邮件" title="没加hosts发送邮件" style="width:200px;height:100px"><img src="/static/posts/docker_install_smtp_server/1565666449.png" alt="加过hosts之后发送邮件" title="加过hosts之后发送邮件" style="width:200px;height:100px">
- 4.邮件发送搜索goertek.com的域，因为公司内网DNS的MX邮件解析问题，在内网找不到要发送给内网邮箱用户的MX记录。。。就是内网找不到xxx@goertek.com的MX记录，所以指定DNS解析resolv.conf🌚

### hosts
```txt
127.0.0.1 goertek.local
```

### resolv.conf
```txt
search goertek.com
options ndots:0
nameserver 114.114.114.114
```

### smtp.py
测试py
```python
#!/usr/bin/python3

import smtplib
from email.header import Header
from email.mime.text import MIMEText

sender = 'willson-wu-shi-ge-dao-lao-ma?@goertek.local'
receivers = ['willson.wu@goertek.com']

message = MIMEText('SMTP服务邮件发送测试...  请勿回复！', 'plain', 'utf-8')

subject = 'SMTP服务邮件测试'
message['Subject'] = Header(subject, 'utf-8')

try:
    smtpObj = smtplib.SMTP('10.10.192.18', 10025)
    smtpObj.sendmail(sender, receivers, message.as_string())
    print ("邮件发送成功")
except smtplib.SMTPException:
    print ("Error: 无法发送邮件")
```
执行测试`python3 smtp.py`
亲测内网环境下发邮件没问题！满足需求！
这下搭建的服务都可以配置SMTP邮件通知啦！👌

## 参考资料

- 镜像[namshi/smtp](https://hub.docker.com/r/namshi/smtp) docker hub 上 pulls 10M+
- 镜像作者的[GayHub](https://github.com/namshi/docker-smtp)
- [使用Docker搭建SMTP服务器](https://zhuanlan.zhihu.com/p/34162708)

