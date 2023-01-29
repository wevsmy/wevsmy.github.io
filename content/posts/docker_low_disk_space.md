---
title: Docker目录磁盘空间满了
aliases: [/2019/07/16/docker-low-disk-space/]
date: 2019-07-16 16:05:21
categories:
- 计算机
- Linux
- Docker
tags:
- Docker
- 笔记
---


😂昨天刚建的GitLab服务今天就报500了，哭死😭排查发现是`/var/lib/docker`目录满了，咱也不知道原来里面放的啥，咱也不敢动，咱走还不行嘛！

<!--more-->

## 原因

```shell
[gitlab@cep-server-bj ~]$ df -h /var/lib/docker
文件系统             容量  已用  可用 已用% 挂载点
/dev/mapper/cl-root   50G   50G  180M  100% /
```

## 解决方案

- 先看看哪里还有地方让俺去

    ```shell
    [gitlab@cep-server-bj ~]$ df -h
    文件系统             容量  已用  可用 已用% 挂载点
    /dev/mapper/cl-root   50G   50G  180M  100% /
    devtmpfs              63G     0   63G    0% /dev
    tmpfs                 63G   96K   63G    1% /dev/shm
    tmpfs                 63G  4.2G   59G    7% /run
    tmpfs                 63G     0   63G    0% /sys/fs/cgroup
    /dev/sda2           1014M  165M  850M   17% /boot
    /dev/sda1            200M  9.5M  191M    5% /boot/efi
    /dev/mapper/cl-home  5.7T  1.6T  4.2T   28% /home
    tmpfs                 13G   20K   13G    1% /run/user/1000
    tmpfs                 13G     0   13G    0% /run/user/987
    tmpfs                 13G     0   13G    0% /run/user/1001
    ```
    
    嘿，`/dev/mapper/cl-home`这个地方挺大的，就搬到这里吧🙂
    
- 停了docker服务

    ```shell
    systemctl stop docker
    ```

- 给docker建个窝

    ```shell
    sudo mkdir -p /home/dev/var/lib/docker
    ```

- 搬家

    ```shell
    sudo rsync -avz /var/lib/docker/ /home/dev/var/lib/docker
    ```

- 改配置，指向新家

  添加dockerd的项

  ```shell
  sudo vim /lib/systemd/system/docker.service
  ```
  把`dockerd`的启动参数添加`--graph=/home/dev/var/lib/docker`
  修改如下内容：

  ```txt
  [Service]
  ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock --graph=/home/dev/var/lib/docker

  ```
  
- 启动docker

  ```shell
  systemctl daemon-reload
  systemctl start docker
  ```

- 确认一哈
  确认`Docker Root Dir`修改是否已经生效
  
  ```shell
  [gitlab@cep-server-bj lib]$ docker info
  Containers: 0
   Running: 0
   Paused: 0
   Stopped: 0
  Images: 2
  Server Version: 18.09.7
  Storage Driver: overlay2
   Backing Filesystem: xfs
   Supports d_type: true
   Native Overlay Diff: false
  Logging Driver: json-file
  Cgroup Driver: cgroupfs
  Plugins:
   Volume: local
   Network: bridge host macvlan null overlay
   Log: awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog
  Swarm: inactive
  Runtimes: runc
  Default Runtime: runc
  Init Binary: docker-init
  containerd version: 894b81a4b802e4eb2a91d1ce216b8817763c29fb
  runc version: 425e105d5a03fabd737a126ad93d62a9eeede87f
  init version: fec3683
  Security Options:
   seccomp
    Profile: default
  Kernel Version: 3.10.0-514.el7.x86_64
  Operating System: CentOS Linux 7 (Core)
  OSType: linux
  Architecture: x86_64
  CPUs: 24
  Total Memory: 125.1GiB
  Name: cep-server-bj
  ID: HL4V:SNMX:2JYC:WISH:K6HM:J4YR:4GQG:SAFL:7YS4:MHNE:WK3I:XRTW
  Docker Root Dir: /home/dev/var/lib/docker
  Debug Mode (client): false
  Debug Mode (server): false
  Registry: https://index.docker.io/v1/
  Labels:
  Experimental: false
  Insecure Registries:
   127.0.0.0/8
  Live Restore Enabled: false
  Product License: Community Engine
  ```
  
  看到`Docker Root Dir: /home/dev/var/lib/docker`我就知道这次搬家稳了😁
  
  话说上面这配置，玩吃鸡卡不卡🙃
  
- 看看原来的镜像还在嘛

  ```shell
  [gitlab@cep-server-bj lib]$ docker images
  REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
  sameersbn/gitlab    12.0.0              6f35c078d0de        2 days ago          2.48GB
  sameersbn/redis     4.0.9-2             8f89b2ebe8be        6 months ago        90.3MB
  ```

- 确认没问题删除`/var/lib/docker/`中文件

## 深入思考

深层次的问题点找到了。。。

我是猪🐷

系统盘总共才有50G的磁盘空间，我却把gitlab的数据全放到了系统根目录下了😂

gitlab的数据占了40多个G的空间

下次注意：启动`docker`其使用的`volumes`要放个大点的地方😁