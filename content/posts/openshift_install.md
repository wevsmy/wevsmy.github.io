---
title: "OpenShift OKD v3.11 安装记录"
date: 2019-09-17T17:47:49+08:00
hidden: false
draft: true
tags: [OpenShift,Docker,K8S,OKD]
keywords: [OpenShift,Docker,K8S,CentOS,VMware,OKD 3.11]
description: "OpenShift安装记录"
slug: ""
---

记录OpenShift安装过程
<!--more-->

# OpenShift安装过程

## 安装流程

- master 8 vCpu 16G RAM 60G Disk CentOS 7 IP 172.31.66.25
- node1  4 vCpu  8G RAM 50G Disk CentOS 7 IP 172.31.66.26
- node2  4 vCpu  8G RAM 50G Disk CentOS 7 IP 172.31.66.161

官方最低[硬件要求](https://docs.okd.io/3.11/install/prerequisites.html#hardware)

~~*俺们公司网络需要配置代理*~~

为啥?因为公司办公网段`172.31.xx.xx`有权限控制，服务器网段没有。

yum `vim /etc/yum.conf`
```txt
proxy=http://10.10.192.18:3128
```

wget`vim /etc/wgetrc`
```txt
https_proxy = http://10.10.192.18:3128/
http_proxy = http://10.10.192.18:3128/
ftp_proxy = http://10.10.192.18:3128/
use_proxy = on
```

pip`vim /etc/profile`
```txt
export https_proxy=http://10.10.192.18:3128
export http_proxy=http://10.10.192.18:3128
```

配置国内源更新源
```bash
cd /etc/yum.repos.d/ && mkdir repo_bak && mv *.repo repo_bak/ \
&& wget http://mirrors.aliyun.com/repo/Centos-7.repo -O /etc/yum.repos.d/Centos-7.repo \
&& wget http://mirrors.163.com/.help/CentOS7-Base-163.repo -O /etc/yum.repos.d/CentOS7-Base-163.repo \
&& yum clean all && yum makecache && yum update \
&& yum -y install git python-pip \
&& pip install --upgrade setuptools
```

克隆openshift-ansible代码&切换分支&安装ansible
```bash
cd /tmp \
&& git clone https://github.com/openshift/openshift-ansible \
&& cd openshift-ansible \
&& git checkout release-3.11 \
&& pip install -r requirements.txt 
```

配置/etc/hosts
```txt
172.31.66.25  openshift-master
172.31.66.26  openshift-node1
172.31.66.161 openshift-node2
```

配置ssh免密
```bash
ssh-keygen
ssh-copy-id root@openshift-master
ssh-copy-id root@openshift-node1
ssh-copy-id root@openshift-node2 
```

ansible ping测试
```txt
[root@localhost openshift-ansible]# ansible all -m ping
openshift-master | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python"
    }, 
    "changed": false, 
    "ping": "pong"
}
openshift-node2 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python"
    }, 
    "changed": false, 
    "ping": "pong"
}
openshift-node1 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python"
    }, 
    "changed": false, 
    "ping": "pong"
}
```

分发/etc/hosts文件至其他节点
```bash
ansible all -m copy -a "src=/etc/hosts dest=/etc/hosts"
```

安装
```bash
ansible-playbook -i inventory/hosts.localhost playbooks/prerequisites.yml
ansible-playbook -i inventory/hosts.localhost playbooks/deploy_cluster.yml
```









[官方安装文档](https://docs.okd.io/3.11/install)
[Openshift OKD v3.11 高级安装](https://blog.csdn.net/qq_16240085/article/details/86004707)