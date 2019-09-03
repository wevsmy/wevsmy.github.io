import xml.sax
from datetime import datetime

import html2text


class CNBlogsHandler(xml.sax.ContentHandler):

    def __init__(self):
        self.CurrentData = ""
        self.title = ""
        self.author = ""
        self.pubDate = ""
        self.guid = ""
        self.description = ""

        self.fileName = ""
        self.date = ""
        self.url = ""

    # 元素开始调用
    def startElement(self, tag, attributes):
        self.CurrentData = tag
        if tag == "item":
            print("*****item*****")

    # 元素结束调用
    def endElement(self, tag):
        if self.CurrentData == "title":
            print("title:", self.title)
        elif self.CurrentData == "author":
            print("author:", self.author)
        elif self.CurrentData == "pubDate":
            print("pubDate:", self.pubDate)
        elif self.CurrentData == "guid":
            print("guid:", self.guid)
        elif self.CurrentData == "description":
            # print("description:", self.description)
            self.saveFile()
        self.CurrentData = ""

    # 读取字符时调用
    def characters(self, content):
        if self.CurrentData == "title":
            self.title = content
        elif self.CurrentData == "author":
            self.author = content
        elif self.CurrentData == "pubDate":
            self.pubDate = content
            GMT_FORMAT = '%a, %d %b %Y %H:%M:%S GMT'
            self.date = datetime.strptime(self.pubDate, GMT_FORMAT)
        elif self.CurrentData == "guid":
            self.guid = content
            name = "cnblog_" + self.guid.split("/")[-1].replace(".html", "").replace("_", "-")
            self.fileName = name + ".md"
            self.url = "../../../../{}/{:0>2}/{:0>2}/{}/".format(self.date.year, self.date.month, self.date.day, name)
        elif self.CurrentData == "description":
            self.description += content

    # 保存Md文件
    def saveFile(self):
        if self.fileName != "":
            md = html2text.html2text(self.description)
            with open(self.fileName, mode="w", encoding="utf-8") as f:
                s = """---
title: {0}
date: {1}
categories:
- 笔记
- 博客园
tags:
- 博客园
- 搬家
- cnblogs
---
# [这是👉{0}👈的摘要]({3})
<!--more-->
{2}
""".format(self.title, self.date, md, self.url)
                f.write(s)
                self.description = ""


if (__name__ == "__main__"):
    # 创建一个 XMLReader
    parser = xml.sax.make_parser()
    # 关闭命名空间
    parser.setFeature(xml.sax.handler.feature_namespaces, 0)

    # 重写 ContextHandler
    Handler = CNBlogsHandler()
    parser.setContentHandler(Handler)

    parser.parse("CNBlogs_BlogBackup_131_201712_201906.xml")
