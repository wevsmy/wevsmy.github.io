---
title: "HDP(2.6.5)集群安装记录"
date: 2019-09-06T18:59:32+08:00
hidden: false
draft: false
tags: [HDP,大数据平台,集群,记录]
keywords: [HDP,hadoop,jdk,java,centos,cloudera,manager,bigdata,大数据平台]
description: "hadoop集群安装记录,大数据平台"
slug: ""
---

HDP(2.6.5)集群安装记录
<!--more-->

# HDP(2.6.5)集群安装记录

## 网络配置(所有节点执行)
```txt
| hostname |      IP       |  说明  |
| :------: | :-----------: | :----: |
|  hdp01   | 172.31.66.32  | master |
|  hdp02   | 172.31.66.34  | node1  |
|  hdp03   | 172.31.66.170 | node2  |
```

**检查ip**

```shell
ifconfig
```

**更改hostname**

```shell
vim /etc/hostname
```

将localhost更改成表格中的hostname(根据业务自行定义)

**更改SELINUX**

```shell
vim /etc/sysconfig/selinux
#修改以下内容
SELINUX=disabled
```

**重启服务器**

```shell
reboot
```

**修改hosts文件**

```shell
vim /etc/hosts
```

对应上表hostname,为hosts文件添加路由

**SSH免密登录**

```shell
ssh-keygen
#enter
```

复制生成的公钥到每个节点(主节点执行)

```shell
scp /root/.ssh/id_rsa.put hdop02:/tmp/
#除master外都需要指向执行
```

**其他节点执行**

```shell
cat /tmp/id_rsa.pub >>/root/.ssh/authorized_keys
```

检查一哈

**关闭防火墙**

```shell
systemctl stop firewalld.service
systemctl disable firewalld.service
```

**开启ntp服务**

```shell
yum install -y ntp
systemctl enble ntpd
systemctl start ntpd
```

## 安装JDK

**下载jdk**

[jdk8 下载](https://www.oracle.com/technetwork/cn/java/javase/downloads/jdk8-downloads-2133151-zhs.html)

在当前目录打开shell

```shell
tar -zxvf jdk-8u181-linux-x64.tar.gz -C /opt/java/
vi /etc/profile

export JAVA_HOME=/opt/java/jdk1.8.0_181
export JRE_HOE=$JAVA_HOME/jre
export CLASSPATH=.:$JAVA_HOME/lib:$JAVA_HOME/jre/lib
export PATH=$PATH:$JAVA_HOME/bin
```

远程分发到其他服务器

```shell
scp -r /opt/java/jdk1.8.0_181/ root@hdp02:/opt/java/
scp -r /opt/java/jdk1.8.0_181/ root@hdp03:/opt/java/

scp /etc/profile root@hdp02:/etc/
scp /etc/profile root@hdp03:/etc/

source /etc/profile
```

## Ambari安装

**下载资源安装包**

```shell
wget http://public-repo-1.hortonworks.com/ambari/centos7/2.x/updates/2.6.2.0/ambari-2.6.2.0-centos7.tar.gz
wget http://public-repo-1.hortonworks.com/HDP/centos7/2.x/updates/2.6.5.0/HDP-2.6.5.0-centos7-rpm.tar.gz
wget http://public-repo-1.hortonworks.com/HDP-UTILS-1.1.0.22/repos/centos7/HDP-UTILS-1.1.0.22-centos7.tar.gz
wget http://public-repo-1.hortonworks.com/HDP-GPL/centos7/2.x/updates/2.6.5.0/HDP-GPL-2.6.5.0-centos7-gpl.tar.gz
```

**安装Apache HTTP 服务器**

```shell
yum install httpd -y
#开启服务并设置开机自启动
systemctl start httpd.service
systemctl enable httpd.service
```

**安装制作yum源**

```shell
yum install yum-utils createrepo
```

**创建http服务器**

http根目录默认是即/var/www/html/

```shell
mkdir -p /var/www/html/ambari
#cd /var/www/html/ambari
#将下载好的安装包上传并解压
tar xvf HDP-2.6.5.0-centos7-rpm.tar.gz -C /var/www/html/ambari
tar xvf ambari-2.6.2.0-centos7.tar.gz -C /var/www/html/ambari
tar xvf HDP-UTILS-1.1.0.22-centos7.tar.gz -C /var/www/html/ambari
tar xvf HDP-GPL-2.6.5.0-centos7-gpl.tar.gz -C /var/www/html/ambari

# 删除压缩包
rm -rf ambari-2.6.2.0-centos7.tar.gz
rm -rf HDP-2.6.5.0-centos7-rpm.tar.gz
rm -rf HDP-UTILS-1.1.0.22-centos7.tar.gz
rm -rf HDP-GPL-2.6.5.0-centos7-gpl.tar.gz
```

验证一哈

![验证一哈](/static/posts/hdp_cluster_install/1.png)

**配置ambari、HDP、HDP-UTILS的本地源**

```shell
cd /etc/yum.repos.d/
wget http://public-repo-1.hortonworks.com/ambari/centos7/2.x/updates/2.6.2.0/ambari.repo
wget http://public-repo-1.hortonworks.com/HDP/centos7/2.x/updates/2.6.5.0/hdp.repo
wget http://public-repo-1.hortonworks.com/HDP-GPL/centos7/2.x/updates/2.6.5.0/hdp.gpl.repo
```

编辑ambari.repo，修改baseurl和gpgkey

```shell
[root@hdc-data1 yum.repos.d]# vi ambari.repo 

#IP均为主节点IP,以下命令需变更IP
#VERSION_NUMBER=2.6.2.0-155
[ambari-2.6.2.0]
name=ambari Version - ambari-2.6.2.0
#baseurl=http://public-repo-1.hortonworks.com/ambari/centos7/2.x/updates/2.6.2.0
baseurl=http://master/ambari/ambari/centos7/2.6.2.0-155
gpgcheck=1
#gpgkey=http://public-repo-1.hortonworks.com/ambari/centos7/2.x/updates/2.6.2.0/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
gpgkey=http://master/ambari/ambari/centos7/2.6.2.0-155/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
enabled=1
priority=1
```

编辑hdp.repo，修改baseurl和gpgkey

**IP均为主节点IP**

```shell
[root@hdc-data1 yum.repos.d]# vi hdp.repo 

#VERSION_NUMBER=2.6.5.0-292
[HDP-2.6.5.0]
name=HDP Version - HDP-2.6.5.0
#baseurl=http://public-repo-1.hortonworks.com/HDP/centos7/2.x/updates/2.6.5.0
baseurl=http://master/ambari/HDP/centos7/2.6.5.0-292
gpgcheck=1
#gpgkey=http://public-repo-1.hortonworks.com/HDP/centos7/2.x/updates/2.6.5.0/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
gpgkey=http://master/ambari/HDP/centos7/2.6.5.0-292/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
enabled=1
priority=1


[HDP-UTILS-1.1.0.22]
name=HDP-UTILS Version - HDP-UTILS-1.1.0.22
#baseurl=http://public-repo-1.hortonworks.com/HDP-UTILS-1.1.0.22/repos/centos7
baseurl=http://master/ambari/HDP-UTILS/centos7/1.1.0.22
gpgcheck=1
#gpgkey=http://public-repo-1.hortonworks.com/HDP/centos7/2.x/updates/2.6.5.0/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
gpgkey=http://master/ambari/HDP-UTILS/centos7/1.1.0.22/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
enabled=1
priority=1
```

编辑hdp.gpl.repo，修改baseurl和gpgkey

```shell
[root@hdc-data1 yum.repos.d]# vi hdp.gpl.repo 

#VERSION_NUMBER=2.6.5.0-292
[HDP-GPL-2.6.5.0]
name=HDP-GPL Version - HDP-GPL-2.6.5.0
#baseurl=http://public-repo-1.hortonworks.com/HDP-GPL/centos7/2.x/updates/2.6.5.0
baseurl=http://master/ambari/HDP-GPL/centos7/2.6.5.0-292
gpgcheck=1
#gpgkey=http://public-repo-1.hortonworks.com/HDP-GPL/centos7/2.x/updates/2.6.5.0/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
gpgkey=http://master/ambari/HDP-GPL/centos7/2.6.5.0-292/RPM-GPG-KEY/RPM-GPG-KEY-Jenkins
enabled=1
priority=1
```

分发到其他机器

```shell
scp /etc/yum.repos.d/ambari.repo root@hdp02:/etc/yum.repos.d/
scp /etc/yum.repos.d/ambari.repo root@hdp03:/etc/yum.repos.d/
scp /etc/yum.repos.d/hdp.repo root@hdp02:/etc/yum.repos.d/
scp /etc/yum.repos.d/hdp.repo root@hdp03:/etc/yum.repos.d/
scp /etc/yum.repos.d/hdp.gpl.repo root@hdp02:/etc/yum.repos.d/
scp /etc/yum.repos.d/hdp.gpl.repo root@hdp03:/etc/yum.repos.d/
```

每台机器yum配置

```shell
yum clean all
yum makecache
yum list
```

## 安装Mysql

**安装及初始化设置**

```shell
[root@hdc-data1 ~]# yum install mariadb-server
[root@hdc-data1 ~]# systemctl start mariadb
[root@hdc-data1 ~]# systemctl enable mariadb
[root@hdc-data1 ~]# mysql_secure_installation

#首先是设置密码，会提示先输入密码
Enter current password for root (enter for none):<–初次运行直接回车
#设置密码
Set root password? [Y/n] <– 是否设置root用户密码，输入y并回车或直接回车
New password: <– 设置root用户的密码
Re-enter new password: <– 再输入一次你设置的密码
#其他配置
Remove anonymous users? [Y/n] <– 是否删除匿名用户，回车
Disallow root login remotely? [Y/n] <–是否禁止root远程登录,回车,
Remove test database and access to it? [Y/n] <– 是否删除test数据库，回车
Reload privilege tables now? [Y/n] <– 是否重新加载权限表，回车
```

**安装完成后创建ambari数据库及用户**

```shell
#进入mysql shell
mysql -uroot -p
```

```mysql
create database ambari character set utf8 ;  
CREATE USER 'ambari'@'%'IDENTIFIED BY 'ambari123';
GRANT ALL PRIVILEGES ON *.* TO 'ambari'@'%';
FLUSH PRIVILEGES;
```

如果要安装Hive，创建Hive数据库和用户

```mysql
create database hive character set utf8 ;  
CREATE USER 'hive'@'%'IDENTIFIED BY 'hive123';
GRANT ALL PRIVILEGES ON *.* TO 'hive'@'%';
FLUSH PRIVILEGES;
```

如果要安装Oozie，创建Oozie数据库和用户

```mysql
create database oozie character set utf8 ;  
CREATE USER 'oozie'@'%'IDENTIFIED BY 'oozie123';
GRANT ALL PRIVILEGES ON *.* TO 'oozie'@'%';
FLUSH PRIVILEGES;
```

**安装ambari**

```shell
yum install ambari-server
```

**下载mysql驱动**
[mysql-connector-java 下载](http://central.maven.org/maven2/mysql/mysql-connector-java/5.1.40/)
将mysql-connector-Java.jar复制到/usr/share/java目录下

```shell
mkdir /usr/share/java
cp mysql-connector-java-5.1.40.jar /usr/share/java/mysql-connector-java.jar
```

将mysql-connector-java.jar复制到/var/lib/ambari-server/resources目录下

```shell
cp mysql-connector-java-5.1.40.jar /var/lib/ambari-server/resources/mysql-jdbc-driver.jar
```

**编辑/etc/ambari-server/conf/ambari.properties，添加如下内容**

```shell
server.jdbc.driver.path=/usr/share/java/mysql-connector-java.jar
#【可选】修改默认8080端口
#client.api.port=18080
```

**ambaria初始化**

```shell
#设置mysql驱动
ambari-server setup --jdbc-db=mysql --jdbc-driver=/usr/share/java/mysql-connector-java.jar 
ambari-server setup
```

完整初始化如下：

```shell
[root@hdc-data1 ~]# ambari-server setup
Using python  /usr/bin/python
Setup ambari-server
Checking SELinux...
SELinux status is 'disabled'
Customize user account for ambari-server daemon [y/n] (n)? y
Enter user account for ambari-server daemon (root):
Adjusting ambari-server permissions and ownership...
Checking firewall status...
Checking JDK...
[1] Oracle JDK 1.8 + Java Cryptography Extension (JCE) Policy Files 8
[2] Oracle JDK 1.7 + Java Cryptography Extension (JCE) Policy Files 7
[3] Custom JDK
==============================================================================
Enter choice (1): 3
WARNING: JDK must be installed on all hosts and JAVA_HOME must be valid on all hosts.
WARNING: JCE Policy files are required for configuring Kerberos security. If you plan to use Kerberos,please make sure JCE Unlimited Strength Jurisdiction Policy Files are valid on all hosts.
Path to JAVA_HOME: /opt/java/jdk1.8.0_181
Validating JDK on Ambari Server...done.
Checking GPL software agreement...
GPL License for LZO: https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
Enable Ambari Server to download and install GPL Licensed LZO packages [y/n] (n)? y
Completing setup...
Configuring database...
Enter advanced database configuration [y/n] (n)? y
Configuring database...
==============================================================================
Choose one of the following options:
[1] - PostgreSQL (Embedded)
[2] - Oracle
[3] - MySQL / MariaDB
[4] - PostgreSQL
[5] - Microsoft SQL Server (Tech Preview)
[6] - SQL Anywhere
[7] - BDB
==============================================================================
Enter choice (1): 3
Hostname (localhost): 
Port (3306): 
Database name (ambari): 
Username (ambari): 
Enter Database Password (bigdata): 
Re-enter password: 
Configuring ambari database...
Configuring remote database connection properties...
WARNING: Before starting Ambari Server, you must run the following DDL against the database to create the schema: /var/lib/ambari-server/resources/Ambari-DDL-MySQL-CREATE.sql
Proceed with configuring remote database connection properties [y/n] (y)? y
Extracting system views...
.....ambari-admin-2.6.2.0.155.jar
......
Adjusting ambari-server permissions and ownership...
Ambari Server 'setup' completed successfully.
```

**将Ambari数据库脚本导入到数据库**

```shell
#用Ambari用户（上面设置的用户）登录mysql
mysql -u ambari -p
use ambari;
source /var/lib/ambari-server/resources/Ambari-DDL-MySQL-CREATE.sql
```

**启动Ambari**

```shell
ambari-server start
```

## WebUI配置

图截得有点糊...

![WebUI](/static/posts/hdp_cluster_install/2.png)

创建集群名称

![WebUI](/static/posts/hdp_cluster_install/3.png)

选择HDP版本和选择本地仓库

![WebUI](/static/posts/hdp_cluster_install/4.png)

配置HDP的Repository

![WebUI](/static/posts/hdp_cluster_install/5.png)

输入集群节点host(FQDN)和Ambari节点SSH的私钥

![WebUI](/static/posts/hdp_cluster_install/6.png)

等待ambari-agents注册

![WebUI](/static/posts/hdp_cluster_install/7.png)

若报错

![WebUI](/static/posts/hdp_cluster_install/8.png)

![WebUI](/static/posts/hdp_cluster_install/9.png)

【遇到问题 Confirm Hosts】
 注册ambari-agents时failed
 NetUtil.py:96 - EOF occurred in violation of protocol (_ssl.c:579)
 SSLError: Failed to connect. Please check openssl library versions.
 解决：如下第三个方案，/etc/ambari-agent/conf/ambari-agent.ini文件只有执行该步骤进行注册才生成。修改后点击“Retry Failed”按钮，等待注册成功进入下一步。

注:无报错时无此文件,需报错后再行处理

```shell
# 1、yum upgrade openssl 已是最新本版，未解决
# 2、vi /etc/python/cert-verification.cfg 修改 verify=disable，未解决
[https]
#verify=platform_default
verify=disable
# 3、最后解决方案 在ambari-agent的配置文件/etc/ambari-agent/conf/ambari-agent.ini
 在 ［security］标签下面增加一项
[security]
force_https_protocol=PROTOCOL_TLSv1_2
```

![WebUI](/static/posts/hdp_cluster_install/10.png)

选择安装组件，（最小化安装HDFS+YARN+MAPREDUCE2+Ambari Metrics+SmartSense+ZooKeeper+Hbase）

不必要的组件可以暂时不安装节省安装时间，后续可以再添加安装组件

![WebUI](/static/posts/hdp_cluster_install/11.png)

![WebUI](/static/posts/hdp_cluster_install/12.png)

实际部署时需按规划设计进行分配（注意：Hbase HA 的话在Hbase Master 点击后面的小绿色+号，添加standby master）：

![WebUI](/static/posts/hdp_cluster_install/13.png)

工作节点角色分配(生产环境全勾了)

![WebUI](/static/posts/hdp_cluster_install/14.png)

组件配置信息修改
通常数据目录修改到/data/目录下，有红色信息提示的组件表示要输入相应的账号密码。以下示例，可根据自己的实际情况配置。

HDFS

![WebUI](/static/posts/hdp_cluster_install/15.png)

![WebUI](/static/posts/hdp_cluster_install/16.png)

HIVE,若数据库端口修改按实际填写

![WebUI](/static/posts/hdp_cluster_install/17.png)

Oozie

![WebUI](/static/posts/hdp_cluster_install/18.png)

Zookeeper

![WebUI](/static/posts/hdp_cluster_install/19.png)

![WebUI](/static/posts/hdp_cluster_install/20.png)

![WebUI](/static/posts/hdp_cluster_install/21.png)

![WebUI](/static/posts/hdp_cluster_install/22.png)

暂时修改了以下属性，具体配置信息可根据实际情况后续相应修改
```text
| 端口属性                                  | 修改值                                |
| :---------------------------------------- | :------------------------------------ |
| dfs.namenode.http-address                 | octserver1.hadoop:50770 （def:50070） |
| yarn.resourcemanager.webapp.address       | octserver2.hadoop:18088 （def:8088）  |
| yarn.resourcemanager.webapp.https.address | octserver2.hadoop:18090(def:8090)     |
| mapreduce.jobhistory.webapp.address       | octserver2.hadoop:19898 (def:19888)   |
```

等待安装完成

![WebUI](/static/posts/hdp_cluster_install/23.png)

直到所有节点成功安装完成才能进行下一步操作

![WebUI](/static/posts/hdp_cluster_install/24.png)

最终结果界面类似如下：

![WebUI](/static/posts/hdp_cluster_install/25.png)

