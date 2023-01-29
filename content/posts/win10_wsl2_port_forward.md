---
title: "win10 wsl2 端口转发到宿主机"
date: 2019-11-15T15:12:59+08:00
hidden: false
draft: false
tags: ["win10","wls2","笔记","network",]
keywords: ["win10","wls2","端口转发","network",]
description: ""
slug: ""
---

wsl2使用本地127.0.0.1访问 
<!--more-->

```powershell
$remoteport = bash.exe -c "ifconfig eth0 | grep 'inet '"
$found = $remoteport -match '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}';
if( $found ){
  $remoteport = $matches[0];
} else{
  echo "The Script Exited, the ip address of WSL 2 cannot be found";
  exit;
}
#[Ports]
#All the ports you want to forward separated by coma
$ports=@(80,443,8011,8080);
#[Static ip]
#You can change the addr to your ip config to listen to a specific address
$addr='0.0.0.0';
$ports_a = $ports -join ",";
#Remove Firewall Exception Rules
#iex "Remove-NetFireWallRule -DisplayName 'WSL 2 Firewall Unlock' ";
#adding Exception Rules for inbound and outbound Rules
#iex "New-NetFireWallRule -DisplayName 'WSL 2 Firewall Unlock' -Direction Outbound -LocalPort $ports_a -Action Allow -Protocol TCP";
#iex "New-NetFireWallRule -DisplayName 'WSL 2 Firewall Unlock' -Direction Inbound -LocalPort $ports_a -Action Allow -Protocol TCP";
for( $i = 0; $i -lt $ports.length; $i++ ){
  $port = $ports[$i];
  iex "netsh interface portproxy delete v4tov4 listenport=$port listenaddress=$addr";
  iex "netsh interface portproxy add v4tov4 listenport=$port listenaddress=$addr connectport=$port connectaddress=$remoteport";
}
# show all
netsh interface portproxy show all
```

使用管理员权限执行
```bash
sudo ./proxy.ps1
```

ps: 对`$ports`参数进行增删，自行定义