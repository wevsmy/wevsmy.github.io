---
title: hexo添加文章更新时间
date: 2019-07-09 19:09:57
categories:
- 笔记
- hexo
tags:
- hexo
---

现在使用的主题只有文章创建时间，并没有文章更新时间，就自己捣鼓捣鼓添加了一个文章更新时间，记录一下。
<!--more-->

注：在[aria主题](https://github.com/wevsmy/hexo-theme-aria/)捣鼓的，别的不一定使用，但可以参考。

# _config.yml

修改主题的配置
主题配置文件添加开关，便于不想显示了可以关掉。
```yml
# 显示更新日期 默认为post文件修改日期
display_updated: true
```

# index.njk

修改样式
修改主页的样式，在创建日期`{% if post.date %}` xxxxx `{% endif %}`下方添加下面代码。

注：只有在主题配置中打开显示更新日期的开关，并且更新时间大于创建时间1天，才会显示更新时间。

```
{%if theme.display_updated and post.updated - post.date > 86400000 %}
	<span class="post-updated">
		<span class="post-meta-divider divider">|</span>
		<i class="far fa-calendar-plus"></i>
		<span>
			<time title="post-updated" itemprop="dateUpdated datePublished" datetime="{{ moment(post.updated).format() }}">
				{{ date(post.updated, config.date_format) }}
			</time>
		</span>
	</span>
{% endif %}
```

# post.njk

修改每一页详细内容的样式。
修改内容与`index.njk`一样。