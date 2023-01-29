---
title: "利用wireguard内网穿透"
date: 2021-07-13T15:40:58+08:00
hidden: false
draft: false
tags: ["wireguard","linux","network","docker",]
keywords: ["wireguard","linux","wg","network","nat","docker","docker-compose",]
description: ""
slug: ""
---

利用wireguard内网穿透web访问管理配置 
<!--more-->


配置文件

```txt
wevsmy@SINOWEL-PC:~/d_project/Lab/docker-compose/wireguard$ tree
.
├── docker-compose.yml
├── init.sh
├── watch.sh
├── wg-api
└── wg-api.sh

0 directories, 5 files
```

docker-compose.yml
```yml
version: "3.6"
services:
  wireguard:
    image: ghcr.io/linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      # - SERVERURL=wireguard.domain.com #optional
      - SERVERURL=192.168.59.253 #optional
      - SERVERPORT=51821 #optional
      - PEERS=1 #optional
      - PEERDNS=10.13.13.1 #optional
      - INTERNAL_SUBNET=10.13.13.0 #optional
      - ALLOWEDIPS=0.0.0.0/0 #optional
    volumes:
      - /lib/modules:/lib/modules
      - ./volumes/wireguard/config:/config
      - ./init.sh:/config/custom-cont-init.d/init.sh:ro
      - ./watch.sh:/config/custom-services.d/watch.sh:ro
      - ./wg-api:/app/wg-api:ro
      - ./wg-api.sh:/config/custom-services.d/wg-api.sh:ro
    ports:
      - 51821:51820/udp
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped
    dns:
      - 114.114.114.114

  wg-gen-web-demo:
    image: vx3r/wg-gen-web:latest
    container_name: wg-gen-web-demo
    restart: unless-stopped
    expose:
      - 8080/tcp
    ports:
      - 51822:8080
    environment:
      - WG_CONF_DIR=/data
      - WG_INTERFACE_NAME=wg0.conf
      - WG_STATS_API=http://wireguard:8080
      - WG_STATS_API_USER=
      - WG_STATS_API_PASS=
      # - SMTP_HOST=smtp.gmail.com
      # - SMTP_PORT=587
      # - SMTP_USERNAME=no-reply@gmail.com
      # - SMTP_PASSWORD=******************
      # - SMTP_FROM=Wg Gen Web <no-reply@gmail.com>
      # - OAUTH2_PROVIDER_NAME=github
      # - OAUTH2_PROVIDER=https://github.com
      # - OAUTH2_CLIENT_ID=******************
      # - OAUTH2_CLIENT_SECRET=******************
      # - OAUTH2_REDIRECT_URL=https://wg-gen-web-demo.127-0-0-1.fr
    volumes:
      - ./volumes/wireguard/config:/data
    depends_on: 
      - wireguard
```

init.sh
```bash
#!/usr/bin/with-contenv bash

echo "**** installing inotify-tools ****"
apt-get update && apt-get install inotify-tools -y

echo "**** installing config ****"

echo '
[Interface]
Address = '$(echo "$INTERNAL_SUBNET" | awk 'BEGIN{FS=OFS="."} NF--')'.1
ListenPort = 51820
PrivateKey = '$(cat /config/server/privatekey-server)'
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
' > /config/wg0.conf


echo '
{
  "address": [
    "'$(echo "$INTERNAL_SUBNET" | awk 'BEGIN{FS=OFS="."} NF--')'.1/24"
  ],
  "listenPort": 51820,
  "mtu": 0,
  "privateKey": "'$(cat /config/server/privatekey-server)'",
  "publicKey": "'$(cat /config/server/publickey-server)'",
  "endpoint": "'${SERVERURL}:${SERVERPORT}'",
  "persistentKeepalive": 16,
  "dns": [
    "'$(echo "$INTERNAL_SUBNET" | awk 'BEGIN{FS=OFS="."} NF--')'.1"
  ],
  "allowedips": [
    "'${ALLOWEDIPS}'"
  ],
  "preUp": "echo WireGuard PreUp",
  "postUp": "iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE",
  "preDown": "echo WireGuard PreDown",
  "postDown": "iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE",
  "updatedBy": "",
  "created": "'$(date +%Y-%m-%dT%H:%M:%S.%NZ)'",
  "updated": "'$(date +%Y-%m-%dT%H:%M:%S.%NZ)'"
}
' > /config/server.json

COREDNSID='44d338ce-e383-11eb-b7fa-0b1c92374c21'
echo '
{
  "id": "'$COREDNSID'",
  "name": "CoreDNS",
  "email": "CoreDNS@example.com",
  "enable": false,
  "ignorePersistentKeepalive": false,
  "presharedKey": "",
  "allowedIPs": [
    "'${ALLOWEDIPS}'"
  ],
  "address": [
    "'$(echo "$INTERNAL_SUBNET" | awk 'BEGIN{FS=OFS="."} NF--')'.1/32"
  ],
  "tags": [],
  "privateKey": "",
  "publicKey": "",
  "createdBy": "",
  "updatedBy": "",
  "created": "'$(date +%Y-%m-%dT%H:%M:%S.%NZ)'",
  "updated": "'$(date +%Y-%m-%dT%H:%M:%S.%NZ)'"
}
' > /config/$COREDNSID
```

watch.sh
```bash
#!/usr/bin/with-contenv bash

while inotifywait -e modify -e create /config/wg0.conf; do
  wg-quick down wg0
  wg-quick up wg0
done

```

wg-api.sh
```bash
#!/usr/bin/with-contenv bash

if netstat -apn | grep -q ":8080 "; then
  echo "Another service is using port 8080, disabling wg-api"
  sleep infinity
else
  exec \
    /app/wg-api --device wg0 --listen 0.0.0.0:8080
fi

```

ps: wg-api
```bash
git clone https://github.com/jamescun/wg-api.git
cd wg-api
CGO_ENABLED=0 GOOS=linux go build -o wg-api cmd/wg-api.go
cp wg-api ../.
```

