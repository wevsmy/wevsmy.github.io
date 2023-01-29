---
title: "容器底层原理之namespace和cgroups"
date: 2021-08-23T10:44:22+08:00
hidden: false
draft: false
tags: [namespace,cgroups,docker,linux,]
keywords: [namespace,cgroups,docker,linux,]
description: "容器底层原理之namespace和cgroups"
slug: ""
---

Linux内核中的namespace和cgroups技术实现了各种资源的隔离与控制。 
<!--more-->

# Namespace
Namespace 是将内核的全局资源做封装，使得每个namespace 都有一份独立的资源，因此不同的进程在各自的namespace内对同一种资源的使用互不干扰。
```text
Namespace技术实现了各种资源的隔离。
```

|Namespace 名称|作用|内核版本|
|---|---|---|
|Mount(mnt)|隔离挂载点|2.4.19|
|Process ID(pid)|隔离进程ID|2.6.24|
|Network(net)|隔离网络设备、端口号等|2.6.29|
|Interprocess Communication (ipc)|隔离进程间通信 System V IPC 和 POSIX message queues|2.6.19|
|UTS Namespace(uts)|隔离主机名和域名|2.6.19|
|User Namespace(user)|隔离用户和用户组|3.8|
|Control group(cgroups)Namespace|隔离cgroups根目录|4.6|
|Time Namespace|隔离系统时间|5.6|

3.8 的内核开始，/proc/[pid]/ns 目录下会包含进程所属的 namespace 信息.
使用下面的命令可以查看当前进程所属的 namespace 信息：`ll /proc/$$/ns`
ex:
```log
vagrant@ubuntu20-04:~$ ll /proc/$$/ns
total 0
dr-x--x--x 2 vagrant vagrant 0 Aug 23 03:38 ./
dr-xr-xr-x 9 vagrant vagrant 0 Aug 23 03:38 ../
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 cgroup -> 'cgroup:[4026531835]'
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 ipc -> 'ipc:[4026531839]'
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 mnt -> 'mnt:[4026531840]'
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 net -> 'net:[4026531992]'
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 pid -> 'pid:[4026531836]'
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 pid_for_children -> 'pid:[4026531836]'
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 user -> 'user:[4026531837]'
lrwxrwxrwx 1 vagrant vagrant 0 Aug 23 03:38 uts -> 'uts:[4026531838]'
```


## 隔离挂载点（mount）
Mount Namespace 实现了不同进程可以看到不同的挂载信息。
```text
换句话说说，容器内的挂载操作不会影响到主机。
```
ex:
使用`unshare`命令新建一个`mount namespace`
```bash
sudo unshare --mount --fork /bin/bash
```
创建一个临时挂载目录
```bash
mkdir /tmp/tmpfs
```
使用`tmpfs`挂载一个目录
```bash
mount -t tmpfs -o size=1024k tmpfs /tmp/tmpfs
```
当前窗口查看挂载信息
```log
root@ubuntu20-04:~# mkdir /tmp/tmpfs
root@ubuntu20-04:~# mount -t tmpfs -o size=1024k tmpfs /tmp/tmpfs
root@ubuntu20-04:~# df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        39G  1.3G   38G   4% /
udev            977M     0  977M   0% /dev
tmpfs           994M     0  994M   0% /dev/shm
tmpfs           199M  924K  198M   1% /run
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           199M     0  199M   0% /run/user/1000
tmpfs           994M     0  994M   0% /sys/fs/cgroup
/dev/loop1       56M   56M     0 100% /snap/core18/2128
/dev/loop0       71M   71M     0 100% /snap/lxd/21029
/dev/loop2       33M   33M     0 100% /snap/snapd/12704
tmpfs           1.0M     0  1.0M   0% /tmp/tmpfs
vagrant@ubuntu20-04:~$ 
```

新开一个窗口查看挂载信息,看到没有`/tmp/tmpfs`挂载信息
```log
Last login: Mon Aug 23 03:38:34 2021 from 10.0.2.2
vagrant@ubuntu20-04:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            977M     0  977M   0% /dev
tmpfs           199M  932K  198M   1% /run
/dev/sda1        39G  1.3G   38G   4% /
tmpfs           994M     0  994M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           994M     0  994M   0% /sys/fs/cgroup
/dev/loop1       56M   56M     0 100% /snap/core18/2128
/dev/loop0       71M   71M     0 100% /snap/lxd/21029
/dev/loop2       33M   33M     0 100% /snap/snapd/12704
tmpfs           199M     0  199M   0% /run/user/1000
vagrant@ubuntu20-04:~$ 
```

## 隔离进程ID(pid)
用于实现不同`PID Namespace`内的进程拥有相同的`ID`.

创建一个`pid namespace`
```bash
sudo unshare --pid --fork --mount-proc /bin/bash
```

查看进程信息，1号进程为`bash`
```log
root@ubuntu20-04:~#
root@ubuntu20-04:~# sudo unshare --pid --fork --mount-proc /bin/bash 
root@ubuntu20-04:~# ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1   8960  3892 pts/0    S    03:52   0:00 /bin/bash
root           8  0.0  0.1  10616  3440 pts/0    R+   03:52   0:00 ps aux
root@ubuntu20-04:~#
```

## 隔离网络设备、端口号(net)
`net namespace`实现网络设备的隔离。

查看主机网络信息
```log
root@ubuntu20-04:~# 
root@ubuntu20-04:~# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 02:14:28:cf:54:43 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic enp0s3
       valid_lft 85336sec preferred_lft 85336sec
    inet6 fe80::14:28ff:fecf:5443/64 scope link 
       valid_lft forever preferred_lft forever
root@ubuntu20-04:~# 
```

创建一个`net namespace`
```bash
sudo unshare --net --fork /bin/bash
```

查看此`net namespace`下网络信息
```log
root@ubuntu20-04:~# 
root@ubuntu20-04:~# sudo unshare --net --fork /bin/bash
root@ubuntu20-04:~# ip a
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
root@ubuntu20-04:~# 
```

## 隔离主机名（uts）
`UTS Namespace`主要是用来隔离主机名的，它允许每个`UTS Namespace`拥有一个独立的主机名。

创建一个 `UTS Namespace`
```bash
sudo unshare --uts --fork /bin/bash
```
创建完`namespace`后当前终端已经处于一个独立的`UTS Namespace`中了。
先看下主机名、然后在修改主机名、最后查看主机。
```log
root@ubuntu20-04:~# sudo unshare --uts --fork /bin/bash
root@ubuntu20-04:~# hostname
ubuntu20-04
root@ubuntu20-04:~# hostname -b changehostname
root@ubuntu20-04:~# hostname
changehostname
root@ubuntu20-04:~# 
```
上面输出已经看到成功修改了主机名。
打开新的`bash`终端查看主机名
```log
Last login: Mon Aug 23 03:43:22 2021 from 10.0.2.2
vagrant@ubuntu20-04:~$ sudo -i
root@ubuntu20-04:~# hostname
ubuntu20-04
root@ubuntu20-04:~# 
```
主机名并未被修改，验证`UTS Namespace`隔离主机名。

## 隔离进程间通信（ipc）
`IPC Namespace`主要是用来隔离进程间通信的。
ex:
```text
PID Namespace 和 IPC Namespace 一起使用可以实现同一 IPC Namespace 内的进程彼此可以通信，不同 IPC Namespace 的进程却不能通信。
```

使用`unshare`命令来创建一个`IPC Namespace`
```bash
sudo unshare --ipc --fork /bin/bash
```

- `ipcs -q` 命令用于查看系统间通信队列列表。
- `ipcmk -Q` 命令用于创建系统间通信队列。


```log
root@ubuntu20-04:~# 
root@ubuntu20-04:~# sudo unshare --ipc --fork /bin/bash
root@ubuntu20-04:~# ipcs -q

------ Message Queues --------
key        msqid      owner      perms      used-bytes   messages    

root@ubuntu20-04:~# ipcmk -Q
Message queue id: 0
root@ubuntu20-04:~# ipcs -q

------ Message Queues --------
key        msqid      owner      perms      used-bytes   messages    
0xf350f2cb 0          root       644        0            0           

root@ubuntu20-04:~# 
```

打开新新窗口终端，查看系统通信队列。
```log
Last login: Mon Aug 23 04:07:29 2021 from 10.0.2.2
vagrant@ubuntu20-04:~$ sudo -i
root@ubuntu20-04:~# ipcs -q

------ Message Queues --------
key        msqid      owner      perms      used-bytes   messages    

root@ubuntu20-04:~# 
```

结果可以看到，在单独的`IPC Namespace`内创建的系统通信队列在主机上无法查看，即`IPC Namespace`实现了系统间通信对列的隔离。


## 隔离用户和用户组（user）
`User Namespace` 主要是用来隔离用户和用户组的。

一个比较典型的应用场景就是在主机上以非`root`用户运行的进程可以在一个单独的`User Namespace`中映射成`root`用户。
使用`User Namespace`可以实现进程在容器内拥有`root`权限，而在主机上却只是普通用户。

`User Namesapce`的创建是可以不使用 root 权限的。
下面我们以普通用户的身份创建一个`User Namespace`，命令如下：
```bash
unshare --user -r /bin/bash
```

```log
vagrant@ubuntu20-04:~$ 
vagrant@ubuntu20-04:~$ unshare --user -r /bin/bash
root@ubuntu20-04:~# id
uid=0(root) gid=0(root) groups=0(root)
root@ubuntu20-04:~# reboot
Failed to connect to bus: Operation not permitted
Failed to open initctl fifo: Permission denied
Failed to talk to init daemon.
root@ubuntu20-04:~# 
```

可以看到，在新创建的`User Namespace`内虽然是`root`用户，但是并没有权限执行`reboot`命令。这说明在隔离的`User Namespace`中，并不能获取到主机的`root`权限，也就是说`User Namespace`实现了用户和用户组的隔离。

# Cgroups
Cgroups，其名称源自控制组群（control groups）的简写，也是Linux内核的一个功能，用来限制、控制与统计一个进程组的资源（如CPU、内存、磁盘输入输出等）。
```text
Cgroups技术用来限制容器内进程使用CPU、内存的资源的使用量。
```

## `cgroups`的主要作用
`cgroups`的主要目的是为不同用户层面的资源管理提供一个统一化的接口。从单个任务的资源控制到操作系统层面的虚拟化，`cgroups`四大功能:
- 资源限制：`cgroups`可以对任务要求的总资源总额进行限制。诸如，设定任务运行时使用的内存上限，一旦超出内核就发`OOM killer(Out-Of-Memory killer)`。
- 资源统计：`cgoups`可以统计系统的资源使用量，比如`CPU`使用时长、内存用量等。当前云端产品按使用量计费的方式采用的底层实现方式。
- 任务控制：`cgroups`可以对任务执行挂起、恢复等操作。
- 优先级分配：通过分配的`CPU`时间片数量和磁盘`IO`带宽，实际上就等同于控制了任务运行的优先级。

## `cgroups`的文件系统接口
`cgroups`以文件的方式提供应用接口，可以通过`mount`命令查看`cgroups`默认的挂载点：
```shell
root@ubuntu20-04:~# mount | grep cgroup
tmpfs on /sys/fs/cgroup type tmpfs (ro,nosuid,nodev,noexec,mode=755)
cgroup2 on /sys/fs/cgroup/unified type cgroup2 (rw,nosuid,nodev,noexec,relatime,nsdelegate)
cgroup on /sys/fs/cgroup/systemd type cgroup (rw,nosuid,nodev,noexec,relatime,xattr,name=systemd)
cgroup on /sys/fs/cgroup/hugetlb type cgroup (rw,nosuid,nodev,noexec,relatime,hugetlb)
cgroup on /sys/fs/cgroup/net_cls,net_prio type cgroup (rw,nosuid,nodev,noexec,relatime,net_cls,net_prio)
cgroup on /sys/fs/cgroup/freezer type cgroup (rw,nosuid,nodev,noexec,relatime,freezer)
cgroup on /sys/fs/cgroup/pids type cgroup (rw,nosuid,nodev,noexec,relatime,pids)
cgroup on /sys/fs/cgroup/rdma type cgroup (rw,nosuid,nodev,noexec,relatime,rdma)
cgroup on /sys/fs/cgroup/devices type cgroup (rw,nosuid,nodev,noexec,relatime,devices)
cgroup on /sys/fs/cgroup/cpuset type cgroup (rw,nosuid,nodev,noexec,relatime,cpuset)
cgroup on /sys/fs/cgroup/perf_event type cgroup (rw,nosuid,nodev,noexec,relatime,perf_event)
cgroup on /sys/fs/cgroup/cpu,cpuacct type cgroup (rw,nosuid,nodev,noexec,relatime,cpu,cpuacct)
cgroup on /sys/fs/cgroup/memory type cgroup (rw,nosuid,nodev,noexec,relatime,memory)
cgroup on /sys/fs/cgroup/blkio type cgroup (rw,nosuid,nodev,noexec,relatime,blkio)
root@ubuntu20-04:~# 
```

## Subsystem(子系统) 

|子系统|作用|
|---|---|
|hugetlb|限制`HugeTLB`(内存页)的使用|
|net_cls|配合流控限制网络带宽|
|net_prio|设置进程的网络流量优先级|
|freezer|暂停/恢复`cgroup`中的任务/进程|
|pids|限制任务/进程的数量|
|rdma|限制`RDMA/IB`资源|
|devices|设备访问权限控制|
|cpuset|分配指定的CPU和内存节点|
|perf_event|允许`Perf`工具基于`Cgroup`分组做性能检测|
|cpu           |控制CPU使用率|
|cpuacct|统计`CPU`使用情况|
|memory |限制内存的使用上限|
|blkio |对块设备的`IO`进行限制|

{{< notice tip >}}
23333
{{< /notice >}}