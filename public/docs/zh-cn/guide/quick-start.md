# 快速上手

本指南将引导你在 5 分钟内，从零开始创建、配置并运行一个属于你自己的文档网站。

## 1. 创建项目

使用官方脚手架是最高效的方式。打开你的终端，运行以下命令：

```bash
# 这会创建一个名为 "my-awesome-docs" 的项目
npm create vue-docs-ui@latest my-awesome-docs
```

然后，进入项目目录并安装依赖：

```bash
cd my-awesome-docs
npm install
```

## 2. 组织你的文档

所有的文档内容都以 Markdown 文件的形式存放在 `public/docs/` 目录下。

- 打开 `public/docs/zh-cn/` 目录。
- 你可以修改现有的 `index.md` 和 `guide` 目录下的文件，或者创建新的 `.md` 文件。

例如，我们来创建一个新页面。在 `public/docs/zh-cn/` 下新建一个 `about.md` 文件：

```markdown
# 关于我们

这是一个关于我们团队的页面。
我们热爱开源和创造！
```

## 3. 配置网站

现在，让我们通过修改配置文件来展示新创建的页面。

打开核心配置文件 `public/config/site.yaml`。

### a. 修改网站信息

更新 `site` 部分，给你的网站一个新标题和 Logo。

```yaml
site:
  title: "我的超赞文档"
  description: "一个使用 Vue Docs UI 构建的网站"
  logo: "🚀" # 你可以使用 emoji 或图片路径
```

### b. 添加到导航栏

在 `navbar.items` 数组中，为“关于”页面添加一个链接。

```yaml
navbar:
  items:
    - title: "首页"
      link: "/zh-cn/"
    - title: "指南"
      link: "/zh-cn/guide/introduction"
    - title: "关于"  # 新增
      link: "/zh-cn/about" # 新增
```

### c. 添加到侧边栏

为了让“关于”页面在侧边栏也可见，我们在 `sidebar.sections` 中添加一个新区域。

```yaml
sidebar:
  sections:
    - title: "入门指南"
      path: "/zh-cn/guide"
      children:
        - title: "介绍"
          path: "/zh-cn/guide/introduction"
        - title: "安装"
          path: "/zh-cn/guide/installation"
        - title: "快速上手"
          path: "/zh-cn/guide/quick-start"
    - title: "关于我们" # 新增区域
      path: "/zh-cn/about" # 新增区域
      children: # 新增区域
        - title: "关于" # 新增区域
          path: "/zh-cn/about" # 新增区域
```

## 4. 启动网站

保存你的所有修改，然后在终端运行：

```bash
npm run dev
```

你的网站现在应该运行在 `http://localhost:5173` 上了。访问它，你会看到更新后的标题、Logo，以及导航栏和侧边栏中新增的“关于”链接。恭喜你，你已经成功掌握了 Vue Docs UI 的基本工作流程！
