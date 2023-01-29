---
title: 使用N2N实现异地组网
date: 2019-08-25 12:03:06
categories:
- 计算机
- Linux
- N2N
tags:
- Linux
- N2N
- 笔记
---

N2N  安装记录，至于N2N是用来做什么的，我也不知道，猪头保命🐷

<!--more-->
# 下载源码
```shell
wget https://github.com/ntop/n2n/archive/2.4.tar.gz
```
# 编译安装
```shell
tar xzvf 2.4.tar.gz
cd /n2n-2.4
make && make install
```
注:make时有的机器可能需要安装依赖`sudo apt install subversion build-essential libssl-dev net-tools`

# supernode
```shell
sudo nohup supernode -l 7443 -v &
```
注：`supernode`需要运行在公网上。使用`nobup`后台运行，`-l 7443`监听7443端口，`-v`用于输出日志，便于调试。
查看日志`tail -f nohup.out`

# edge
```shell
edge -a 10.233.233.1 -c N2NNetwork -k 85f7a0affa50d933485a215eb10fb921 -l 106.53.85.19:7443 -p 3447 -m 16:0c:98:c8:b7:92

edge -a 10.233.233.2 -c N2NNetwork -k 85f7a0affa50d933485a215eb10fb921 -l 106.53.85.19:7443 -p 3447 -m 6e:30:77:c9:4f:bf

edge -a 10.233.233.3 -c N2NNetwork -k 85f7a0affa50d933485a215eb10fb921 -l 106.53.85.19:7443 -p 3447 -m 82:e9:fc:be:e9:a7

```
参数说明：
- “-a <IP地址>”选项（静态地）指定了分配给 TAP 接口的 VPN 的 IP 地址。如果你想要使用 DHCP，你需要在其中一台边缘节点上配置一台 DHCP 服务器，然后使用“-a dhcp:0.0.0.0”选项来代替。
- “-c <组名>”选项指定了 VPN 组的名字（最大长度为 16 个字节）。这个选项可以被用来在同样一组节点中创建多个 VPN。
- “-k <密钥>”选项指定了一个由 twofish 加密的密钥来使用。如果你想要将密钥从命令行中隐藏，你可以使用 N2N_KEY 环境变量。
- “-l <IP地址:端口>”选项指定了超级节点的监听 IP 地址和端口号。为了冗余，你可以指定最多两个不同的超级节点（比如 -l <超级节点 A> -l <超级节点 B>）。
- “-p <端口>” 边缘节点暴露端口
- “-m ”给 TAP 接口分配了一个静态的 MAC 地址。不使用这个参数的话，edge 命令将会随机生成一个 MAC 地址。事实上，为一个 VPN 接口强制指定一个静态的 MAC 地址是被强烈推荐的做法。否则，比如当你在一个节点上重启了 edge 守护程序的时候，其它节点的 ARP 缓存将会由于新生成的 MAC 地址而遭到污染，它们将不能向这个节点发送数据，直到被污染的 ARP 记录被消除。

注：以上3条命令为三台机器上执行的,其中10.233.233.1，运行在supernode节点上，另外其中ip自定义，但是需要注意别与需要组网的机器中的IP冲突了，不然会找不到路由！

# 测试

## 查看ip 
```shell
ubuntu@master01:~/project/n2n$ ip r
default via 172.16.0.1 dev eth0 proto dhcp src 172.16.0.6 metric 100 
10.233.233.0/24 dev edge0 proto kernel scope link src 10.233.233.1 
```
```shell
ubuntu@master02:~/project/n2n$ ip r
default via 172.16.0.1 dev eth0 proto dhcp src 172.16.0.6 metric 100 
10.233.233.0/24 dev edge0 proto kernel scope link src 10.233.233.2 
```

## ping测试
```shell
ubuntu@master01:~/project/n2n$ ping -c 1 10.233.233.2
PING 10.233.233.2 (10.233.233.2) 56(84) bytes of data.
64 bytes from 10.233.233.2: icmp_seq=1 ttl=64 time=39.1 ms

--- 10.233.233.2 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 39.125/39.125/39.125/0.000 ms
ubuntu@master01:~/project/n2n$ ping -c 1 10.233.233.3
PING 10.233.233.3 (10.233.233.3) 56(84) bytes of data.
64 bytes from 10.233.233.3: icmp_seq=1 ttl=64 time=39.1 ms

--- 10.233.233.3 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 39.138/39.138/39.138/0.000 ms
```

# 查看vlan中的节点
```shell

ubuntu@master01:~/project/n2n$ sudo nmap -sP 10.233.233.0-255

Starting Nmap 7.60 ( https://nmap.org ) at 2019-08-25 12:00 CST
Nmap scan report for 10.233.233.2
Host is up (-0.16s latency).
MAC Address: 6E:30:77:C9:4F:BF (Unknown)
Nmap scan report for 10.233.233.3
Host is up (-0.11s latency).
MAC Address: 82:E9:FC:BE:E9:A7 (Unknown)
Nmap scan report for VM-0-6-ubuntu (10.233.233.1)
Host is up.
Nmap done: 256 IP addresses (3 hosts up) scanned in 5.31 seconds
```

# 后续
组网后可以用来干啥？你猜!(逃)

# 参考
- [ntop/n2n](https://github.com/ntop/n2n)
- [异地也要玩局域网——使用N2N，实现异地服务器快速组建内网](https://blog.ilemonrain.com/linux/n2n-v2-tutorial.html)
- [使用N2N，实现异地服务器快速组建内网](https://ysicing.me/posts/n2n-v2-tutorial/)
- [使用n2n搭建虚拟局域网](https://sparkydogx.github.io/2018/12/20/n2n/)