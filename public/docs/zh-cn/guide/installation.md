# 安装

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: 版本 `>= 18.0.0`
- **包管理器**: `npm`、`yarn` 或 `pnpm`

## 推荐方式：使用脚手架

我们强烈推荐使用官方的 `create-vue-docs-ui` 脚手架来创建你的新文档项目。这是最快、最简单的方式，可以确保所有配置都已就绪。

1.  **运行创建命令**:
    ```bash
    npm create vue-docs-ui@latest my-docs
    ```
    这会在当前目录下创建一个名为 `my-docs` 的新文件夹。

2.  **进入项目并安装依赖**:
    ```bash
    cd my-docs
    npm install
    ```

3.  **启动开发服务器**:
    ```bash
    npm run dev
    ```
    现在，你的文档网站已经运行在 `http://localhost:5173` 上了。

## 手动安装 (适用于现有项目)

如果你想在已有的 Vite + Vue 3 项目中手动集成 `vue-docs-ui`，可以按照以下步骤操作：

1.  **安装核心库**:
    ```bash
    npm install vue-docs-ui
    ```

2.  **创建配置文件**:
    在你的 `public` 目录下创建一个 `config` 文件夹，并在其中新建一个 `site.yaml` 文件。你可以从[这里](https://github.com/shenjianZ/vue-docs-ui/blob/main/vue-docs-ui/public/config/site.yaml)复制一个基础模板。

3.  **创建文档目录**:
    在 `public` 目录下创建一个 `docs` 文件夹，用于存放你的 Markdown 文件。

4.  **修改应用入口文件**:
    更新你的 `src/main.ts` (或 `main.js`) 文件，使用 `createDocsApp` 来初始化应用。

    ```typescript
    // src/main.ts
    import { createApp } from 'vue'
    import { createDocsApp } from 'vue-docs-ui'
    import 'vue-docs-ui/dist/style.css' // 引入核心样式

    // 移除原有的 createApp(App).mount('#app')
    
    createDocsApp({
      // el 是挂载点，必须与 index.html 中的 id 一致
      el: '#app',
      // configPath 指向你的主配置文件
      configPath: '/config/site.yaml',
      // aiConfigPath 是可选的 AI 助手配置
      aiConfigPath: '/config/ai.json' 
    })
    ```
