---
title: "利用wireguard内网穿透并用nginx反代"
date: 2021-07-17T15:49:42+08:00
hidden: false
draft: false
tags: ["wireguard","linux","network","docker","nginx",]
keywords: ["wireguard","linux","wg","network","nat","docker","docker-compose","nginx",]
description: ""
slug: ""
---

利用wireguard内网穿透并用nginx反代,实现访问域名到达指定内网服务 
<!--more-->

```conf
server{
  set $forward_scheme http;
  set $server         "localhost";
  set $port           8181;

  listen 8080;
  listen [::]:8080;

  listen 4443 ssl http2;
  listen [::]:4443;

  server_name *.m.weii.ink;

  # crypt SSL
  include conf.d/include/letsencrypt-acme-challenge.conf;
  include conf.d/include/ssl-ciphers.conf;
  ssl_certificate /etc/letsencrypt/live/npm-6/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/npm-6/privkey.pem;

  access_log /config/log/proxy_host-0.log proxy;

  location / {

    rewrite_by_lua_block {
        --判断ip是否合法
        local function JudgeIPString(ipStr)
            if type(ipStr) ~= "string" then
                return false;
            end
            
            --判断长度
            local len = string.len(ipStr);
            if len < 7 or len > 15 then --长度不对
                return false;
            end
        
            --判断出现的非数字字符
            local point = string.find(ipStr, "%p", 1); --字符"."出现的位置
            local pointNum = 0; --字符"."出现的次数 正常ip有3个"."
            while point ~= nil do
                if string.sub(ipStr, point, point) ~= "." then --得到非数字符号不是字符"."
                    return false;
                end
                pointNum = pointNum + 1;
                point = string.find(ipStr, "%p", point + 1);
                if pointNum > 3 then
                    return false;
                end
            end
            if pointNum ~= 3 then --不是正确的ip格式
                return false;
            end
        
            --判断数字对不对
            local num = {};
            for w in string.gmatch(ipStr, "%d+") do
                num[#num + 1] = w;
                local kk = tonumber(w);
                if kk == nil or kk > 255 then --不是数字或超过ip正常取值范围了
                    return false;
                end
            end
        
            if #num ~= 4 then --不是4段数字
                return false;
            end
        
            return ipStr;
        end

        --判断此字符串是否为纯数字
        local function IsNumber(words)
          if string.len(words) < 1 then
            return false
          end
          for i=1,string.len(words) do
            if string.byte(string.sub(words,i,i)) < 48 or string.byte(string.sub(words,i,i)) > 57 then
              return false
            end
          end
          return true
        end

        local s = ngx.var.host
        local proxy_str = ""
        local i = 0
        for x in string.gmatch(s, "([^.]+)") do
            if i > 0 then
              break
            end
            i = i + 1
            proxy_str = x
        end        
        local t={}
        for y in string.gmatch(proxy_str, "([^-]+)") do
            table.insert(t, y)    
        end
        local server = string.format("%s.%s.%s.%s", t[1], t[2], t[3], t[4])
        local port = t[5]

        if JudgeIPString(server) == false or IsNumber(port) == false then
          ngx.var.server = "localhost"
          ngx.var.port = 8181
          --条件不对禁止访问
          return ngx.exit(ngx.HTTP_FORBIDDEN)
        else
          ngx.var.server = server
          ngx.var.port = port
        end

    }

    add_header       X-Served-By $host;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Scheme $scheme;
    proxy_set_header X-Forwarded-Proto  $scheme;
    proxy_set_header X-Forwarded-For    $remote_addr;
    proxy_set_header X-Real-IP          $remote_addr;
    proxy_pass       $forward_scheme://$server:$port;
  }
}

```

在`nginx`中进行路由转发
```bash
route add -net 10.13.13.0/24 gw 172.19.0.6
```
`172.19.0.6` 为wireguard容器IP

ps: 访问`10_13_13_13_8080.m.weii.ink`即访问内网`10.13.13.13:8080`服务

[参考链接](https://hub.docker.com/r/jlesage/nginx-proxy-manager)