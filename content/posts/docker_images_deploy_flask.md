---
title: Docker镜像部署Flask
aliases: [/2018/06/05/docker镜像部署flask/]
date: 2018-06-05 19:24:43
categories:
- 计算机
- Linux
- Docker
tags:
- Flask
---
入坑了，入了Docker的坑，了解了一下docker安装，
照着教程学着部署了一下Flask，
Docker使用uwsgi+nginx+python3.6镜像部署Flask
<!--more-->
# Docker 安装
占坑，因为我已经装过了
~~~
sudo apt-get install docker
~~~
然后查看是否安装成功
~~~
sudo docker -v
~~~
# Docker 镜像制作
编写Dockerfile 文件
因为我是用的flask项目是一个简单的demo没有使用第三方库
也就不用安装第三方库
~~~
FROM tiangolo/uwsgi-nginx-flask:python3.6
COPY ./app /app
~~~
- 第一句表示，该镜像由 tiangolo/uwsgi-nginx-flask:python3.6 继承而来
- 第二句 拷贝项目文件到镜像中

我的项目结构
<img src="/static/posts/docker-images-deploy-flask/33765843.jpg" alt="项目结构" title="项目结构" style="width:197px;height:213px">

uwsgi.ini 文件：
~~~ini
[uwsgi]
module = main
callable = app
~~~
完成后，在跟目录，即 Dockerfile 所在目录运行以下命令： 
~~~
sudo docker build -t myimage .
~~~
构建镜像。（注意后面的 点 ）
# Docker 启动
运行以下命令启动 容器：
~~~
docker container run --name mycon --rm -d -p 9001:80 -it myimage
~~~

其中 --name 表示容器名， --rm 表示停止容器后删除容器， -p 9001:80 表示将当前宿主机 9001 端口对应到容器中 80 端口， -it myimage 表示使用 myimage 镜像（即上面生成的镜像）。

[参考文章](https://blog.csdn.net/Bear_861110453/article/details/80356153)
