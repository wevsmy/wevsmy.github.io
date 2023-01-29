---
title: 使用Flask-Migrate进行管理数据库升级
aliases: [/2019/01/17/使用flask-migrate进行管理数据库升级/]
date: 2019-01-17 10:54:35
categories:
- 笔记

tags:
- 笔记
- Flask
- Python
---

我们在升级系统的时候，经常碰到需要更新服务器端数据结构等操作，之前的方式是通过手工编写alter sql脚本处理，经常会发现遗漏，导致程序发布到服务器上后无法正常使用。
现在我们可以使用[Flask-Migrate](https://flask-migrate.readthedocs.org/en/latest/)插件来解决之，Flask-Migrate插件是基于[Alembic](http://alembic.readthedocs.org/en/latest/)，Alembic是由大名鼎鼎的[SQLAlchemy](http://www.sqlalchemy.org/)作者开发数据迁移工具。

<!--more-->

# 使用Flask-Migrate进行管理数据库升级   

我们在升级系统的时候，经常碰到需要更新服务器端数据结构等操作，之前的方式是通过手工编写alter sql脚本处理，经常会发现遗漏，导致程序发布到服务器上后无法正常使用。
现在我们可以使用[Flask-Migrate](https://flask-migrate.readthedocs.org/en/latest/)插件来解决之，Flask-Migrate插件是基于[Alembic](http://alembic.readthedocs.org/en/latest/)，Alembic是由大名鼎鼎的[SQLAlchemy](http://www.sqlalchemy.org/)作者开发数据迁移工具。

具体操作如下：
- 1.安装Flask-Migrate插件
`$ pip install Flask-Migrate`
- 2.修改Flask App部分的代码，以增加Migrate相关的Command
```text
db = SQLAlchemy(app)
migrate = Migrate(app, db)

manager = Manager(app)
manager.add_command('db', MigrateCommand)
```
- 3.初始化
`$ python app.py db init`
- 4.数据迁移，自动创建迁移代码
`$ python app.py db migrate`
- 5.更新数据库
`$ python app.py db upgrade`
后面如果有Model变更的话，在开发环境下只需要重复执行第4、5步即可。

而在服务器端只需要执行第5步即可实现数据库的迁移工作。

[参考链接](http://www.cnblogs.com/maplye/p/5351060.html)