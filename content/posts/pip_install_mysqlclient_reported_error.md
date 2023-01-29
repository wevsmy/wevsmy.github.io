---
title: pip安装mysqlclient报错
aliases: [/2019/06/18/pip安装mysqlclient报错/]
date: 2019-06-18 18:29:30
categories:
- 计算机
- Linux
- Django
tags:
- Python
- Django
- 笔记
---

使用`Django==2.0.4`报错缺少`mysqlclient`模块的解决方案

<!--more-->

写Django项目的时，启动Django==2.0.4启动直接报错，也是醉了。
```
django.core.exceptions.ImproperlyConfigured: Error loading MySQLdb module. 
Did you install mysqlclient?
```
说缺少`mysqlclient`模块。
简单`pip install mysqlclient`
😭也报错了。。。👇
```
(venv) wilson@goertek-pc:~/Project/electric$ pip install mysqlclient
Collecting mysqlclient
  Using cached https://files.pythonhosted.org/packages/f4/f1/3bb6f64ca7a429729413e6556b7ba5976df06019a5245a43d36032f1061e/mysqlclient-1.4.2.post1.tar.gz
    ERROR: Complete output from command python setup.py egg_info:
    ERROR: /bin/sh: 1: mysql_config: not found
    Traceback (most recent call last):
      File "<string>", line 1, in <module>
      File "/tmp/pip-install-rfq3y_2k/mysqlclient/setup.py", line 16, in <module>
        metadata, options = get_config()
      File "/tmp/pip-install-rfq3y_2k/mysqlclient/setup_posix.py", line 51, in get_config
        libs = mysql_config("libs")
      File "/tmp/pip-install-rfq3y_2k/mysqlclient/setup_posix.py", line 29, in mysql_config
        raise EnvironmentError("%s not found" % (_mysql_config_path,))
    OSError: mysql_config not found
    ----------------------------------------
ERROR: Command "python setup.py egg_info" failed with error code 1 in /tmp/pip-install-rfq3y_2k/mysqlclient/

```
不会百度啊！一查原来是缺少依赖`libmysqld-dev`
安装一哈
```
sudo apt-get install libmysqld-dev
```
ok 没毛病，解决了，记录一下。
