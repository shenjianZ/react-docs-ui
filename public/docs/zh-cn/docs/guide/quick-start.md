# 快速上手

本指南将引导你在 5 分钟内，从零开始创建、配置并运行一个属于你自己的 React 文档网站。

## 1. 创建项目

使用官方脚手架是最高效的方式。打开你的终端，运行以下命令：

```bash
# 这会创建一个名为 "my-awesome-docs" 的项目
npx create-react-docs-ui@latest my-awesome-docs
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

例如，我们来创建一个新页面。在`public/docs/zh-cn/`新建`about`目录以及`about.md`文件 ,
`about.md`的内容如下

```markdown

# 关于我们

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
  description: "一个使用 React Docs UI 构建的网站"
  logo: "🚀" # 你可以使用 emoji 或图片路径
```

### b. 添加到导航栏

在 `navbar.items` 数组中，为“关于”页面添加一个链接。

```yaml
navbar:
  items:
    - title: "首页"
        link: "/"
        active: true
    - title: "文档"
        link: "/docs"
    - title: "关于"  # 新增
        link: "/about" # 新增
```

### c. 添加到侧边栏

为了让“关于”页面在侧边栏也可见，我们在 新建一个 `sidebar.collections.about.sections` ，并且添加一个新条目。

```yaml
sidebar:
  collections:
    about:
      sections:
        # 你可以为 "关于" 页面创建一个新的 section
        - title: "关于我们"
          path: "/about/about"
```

这里侧边栏的about项还需要再创建一个文件`public/docs/zh-cn/about` 下`创建about.md`
## 4. 启动网站

保存你的所有修改，然后在终端运行：

```bash
npm run dev
```

你的网站现在应该运行在 `http://localhost:5173` 上了。访问它，你会看到更新后的标题、Logo，以及导航栏和侧边栏中新增的“关于”链接。恭喜你，你已经成功掌握了 React Docs UI 的基本工作流程！
