# weii blog source
> 博客源码

博客地址: [weii.ink](https://www.weii.ink)

## 源码结构
```text
weii-blog-source
├─archetypes
├─content          // 博客文章 MD
│  ├─about
│  └─posts
├─public           // hugo 生产的静态博客文件
├─static           // 博客所有文件资源
└─themes
   └─meme          // 博客 meme 主题 
```
## 新建文章、页面
```bash
~/blog $ hugo new "posts/hello_world.md"
~/blog $ hugo new "about/_index.md"
```
## 安装
```bash
pnpm run init
```
## 调试
```bash
pnpm run dev
```
## 预览
```bash
pnpm run preview
```
## 编译
```bash
pnpm run build
```
## 更新主题
```bash
pnpm run update
```
## 部署
```bash
pnpm run deploy
```
## 源码
```bash
pnpm run deploy
```