---
title: "Docker开启2376端口使用CA认证"
date: 2019-09-11T08:51:45+08:00
hidden: false
draft: false
tags: [Docker,CA,SSL]
keywords: [Docker,CA,SSL,openssl,linux,2376,HTTPS,证书加密]
description: "Docker开启2376端口使用CA认证"
slug: ""
---

默认情况下，Docker通过非联网的UNIX套接字运行。它还可以选择使用HTTP套接字进行通信。
如果您需要以安全的方式通过网络访问Docker，则可以通过指定tlsverify标志并将Docker的tlscacert标志指向 可信CA证书来启用TLS 。
在守护程序模式下，它仅允许来自由该CA签名的证书进行身份验证的客户端的连接。在客户端模式下，它仅连接到具有由该CA签名的证书的服务器。
<!--more-->

# docker开启2376端口CA认证

## 环境
```txt
ubuntu 18.04
docker community 19.03
```
## 生成CA私钥和公钥
```bash
openssl genrsa -aes256 -out ca-key.pem 4096
```
按提示输入密码，两次

```bash
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem
```
按照提示依次输入密码、国家、省、市、组织名称等
如下俺的：
```txt
ubuntu@VM-0-6-ubuntu:~/project$ openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem
Enter pass phrase for ca-key.pem:
Can't load /home/ubuntu/.rnd into RNG
139779211444672:error:2406F079:random number generator:RAND_load_file:Cannot open file:../crypto/rand/randfile.c:88:Filename=/home/ubuntu/.rnd
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:BeiJing
Locality Name (eg, city) []:Beijing
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Weii Corp   
Organizational Unit Name (eg, section) []:Admin
Common Name (e.g. server FQDN or YOUR name) []:Weii
Email Address []:admin@weii.ink
```

## 创建服务器密钥和证书签名请求（CSR）
```bash
openssl genrsa -out server-key.pem 4096
```

```bash
openssl req -subj "/CN=$HOST" -sha256 -new -key server-key.pem -out server.csr
```
注：将`$HOST`替换为换成你自己服务器外网的IP或者域名。
确保“Common Name”与用于连接Docker的主机名匹配。
比如俺的
```bash
openssl req -subj "/CN=docker.weii.ink" -sha256 -new -key server-key.pem -out server.csr
```

## 配置白名单
0.0.0.0表示所有ip都可以连接(但只有拥有证书的才可以连接成功)
```bash
echo subjectAltName = DNS:docker.weii.ink,IP:127.0.0.1,IP:192.168.0.1 >> extfile.cnf
```
## 将Docker守护程序密钥的扩展使用情况属性设置为仅用于服务器身份验证
```bash
echo extendedKeyUsage = serverAuth >> extfile.cnf
```
## 生成签名证书(输入之前设置的密码)
```bash
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile extfile.cnf
```

## 客户端key
```bash
openssl genrsa -out key.pem 4096
openssl req -subj '/CN=client' -new -key key.pem -out client.csr
```
## 认证
```bash
echo extendedKeyUsage = clientAuth > extfile-client.cnf
```

## 生成cert.pem,需要输入前面设置的密码，生成签名证书
```bash
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out cert.pem -extfile extfile-client.cnf
```
## 删除不需要的文件，两个证书签名请求
```bash
rm -v client.csr server.csr
```
## 修改权限
```bash
chmod -v 0400 ca-key.pem key.pem server-key.pem
chmod -v 0444 ca.pem server-cert.pem cert.pem
```
## 归集服务器证书
```bash
cp server-*.pem  /etc/docker/
cp ca.pem /etc/docker/
```

## 修改docker配置
```bash
vim /lib/systemd/system/docker.service
```
`ExecStart=/usr/bin/dockerd` 下面增加
```bash
--tlsverify \
--tlscacert=/etc/docker/ca.pem \
--tlscert=/etc/docker/server-cert.pem \
--tlskey=/etc/docker/server-key.pem \
-H tcp://0.0.0.0:2376 \
-H unix:///var/run/docker.sock \
```
## 重新加载daemon并重启docker
```bash
systemctl daemon-reload 
systemctl restart docker
```

## 客户端相关证书
```txt
> --cert cert.pem 
> --key key.pem 
> --cacert ca.pem
```

## 验证
```txt
ubuntu@VM-0-6-ubuntu:~/project/CA$ curl https://127.0.0.1:2376/images/json \
> --cert cert.pem \
> --key key.pem \
> --cacert ca.pem
[{"Containers":-1,"Created":1566349217,"Id":"sha256:ed7d2ff5a6232b43bdc89a2220ed989f532c3794422aa2a86823b8bc62e71447","Labels":null,"ParentId":"","RepoDigests":["redis@sha256:50899ea1ceed33fa03232f3ac57578a424faa1742c1ac9c7a7bdb95cdf19b858"],"RepoTags":["redis:alpine"],"SharedSize":-1,"Size":29331594,"VirtualSize":29331594},{"Containers":-1,"Created":1565904159,"Id":"sha256:5a3221f0137beb960c34b9cf4455424b6210160fd618c5e79401a07d6e5a2ced","Labels":{"maintainer":"NGINX Docker Maintainers <docker-maint@nginx.com>"},"ParentId":"","RepoDigests":["nginx@sha256:53ddb41e46de3d63376579acf46f9a41a8d7de33645db47a486de9769201fec9"],"RepoTags":["nginx:latest"],"SharedSize":-1,"Size":125958368,"VirtualSize":125958368},{"Containers":-1,"Created":1565786892,"Id":"sha256:cfcdf565ff94de927d0a86c60e78f7d27e82da313f805d66310785cba4e8452a","Labels":null,"ParentId":"","RepoDigests":["python@sha256:553fd76c04ee1ac1db8ef518161bb6ec325cc3ce3e55bbad73bf40e3abe23960"],"RepoTags":["python:3.6"],"SharedSize":-1,"Size":913432043,"VirtualSize":913432043},{"Containers":-1,"Created":1564107108,"Id":"sha256:2b4ddf654e1c413b21c7253125aa0f34a4ff74154558940fa689f8754ec853c5","Labels":null,"ParentId":"","RepoDigests":["portainer/portainer@sha256:a16919b3e02323e4bd0a8c5023d6fd569525297b9dc9a028d778cb6e13512be5"],"RepoTags":["portainer/portainer:latest"],"SharedSize":-1,"Size":77680455,"VirtualSize":77680455},{"Containers":-1,"Created":1562403218,"Id":"sha256:d279b4072846e89af1dfeb2982addf8c4f2125ad929bb536875e3a32700b86ec","Labels":{"maintainer":"sameer@damagehead.com"},"ParentId":"","RepoDigests":["sameersbn/squid@sha256:e98299069f0c6e3d9b9188903518e2f44ac36b1fa5007e879af518e1c0a234af"],"RepoTags":["sameersbn/squid:3.5.27-2"],"SharedSize":-1,"Size":162465195,"VirtualSize":162465195},{"Containers":-1,"Created":1558433068,"Id":"sha256:704607fca3b537a687a24da68993280d1f4030d138a844d9d5dea650f115f0c7","Labels":null,"ParentId":"","RepoDigests":["filebrowser/filebrowser@sha256:dda58e42fe876520aa2f4a1087023a90ae894263707c4f701d36fda124a20741"],"RepoTags":["filebrowser/filebrowser:latest"],"SharedSize":-1,"Size":32732332,"VirtualSize":32732332}]
```
另一种验证方式
```txt
ubuntu@VM-0-6-ubuntu:~/project/CA$ docker --tlsverify --tlscacert=ca.pem --tlscert=cert.pem --tlskey=key.pem -H=docker.weii.ink:443 ps
```

## 参考链接
[Docker文档](https://docs.docker.com/engine/security/https/)
