
# 📄 文档渲染测试页

> 用于测试文档网站是否正确渲染各种 Markdown / MDX 功能。

---

## 🧭 目录

- [标题测试](#标题测试)
- [文本样式](#文本样式)
- [列表](#列表)
- [代码块](#代码块)
- [表格](#表格)
- [引用块](#引用块)
- [提示块](#提示块)
- [图片](#图片)
- [数学公式](#数学公式)
- [MDX 组件（可选）](#mdx-组件可选)

---

## 标题测试

### H3 标题
#### H4 标题
##### H5 标题
###### H6 标题

### TOC 标题格式测试

#### 带 `inlineCode` 的标题

#### 带 **粗体** 的标题

#### 带 *斜体* 的标题

#### 带 ~~删除线~~ 的标题

#### 混合 **粗体** 与 `inlineCode` 的标题

#### 混合 *斜体* 与 ~~删除线~~ 的标题

#### 混合 **粗体** *斜体* `inlineCode` ~~删除线~~ 的标题

#### 含有 [链接文本](https://example.com) 的标题

#### 中文 `代码` English **Bold** Mixed 标题

#### `create-react-docs-ui` 与 **site.yaml** 字段说明

---

## 文本样式

**粗体**

*斜体*

~~删除线~~

`行内代码`

<kbd>Ctrl</kbd> + <kbd>C</kbd>

---

## 列表

### 无序列表

- Apple
- Banana
  - 子项 1
  - 子项 2
- Orange

### 有序列表

1. 第一步
2. 第二步
3. 第三步

### 任务列表

- [x] 已完成
- [ ] 未完成

---

## 代码块

### JavaScript

```js
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet("World")
````

### Bash

```bash
pnpm install
pnpm dev
```

### JSON

```json
{
  "name": "docs-test",
  "version": "1.0.0"
}
```

---

## 表格

| 功能   | 是否支持 | 备注    |
| ---- | ---- | ----- |
| 标题   | ✅    | 正常    |
| 代码块  | ✅    | 高亮    |
| 数学公式 | ⏳    | 视主题而定 |

---

## 引用块

> 这是一个引用块
> 用于测试样式。

---

## 提示块

> [!NOTE]
> 这是 NOTE 提示块（部分主题支持）

> [!TIP]
> 这是 TIP 提示块

> [!WARNING]
> 这是 WARNING 提示块

---

## 图片

![示例图片](https://picsum.photos/800/400)
![01-image](/images/yrzx.png)

---

## 数学公式

行内公式：

$E = mc^2$

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

---

## MDX 组件（可选）

如果你的文档系统支持 MDX，可以测试：

```jsx
export function Hello() {
  return <div style={{color: 'red'}}>Hello MDX!</div>
}
```

---

## 🔥 折叠块（部分主题支持）

<details>
<summary>点击展开</summary>

这里是折叠内容。

</details>

---

## 🧪 长内容滚动测试

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
（你可以复制多几段测试滚动）

---

## ✅ 渲染检查清单

* [ ] 代码高亮正常
* [ ] 表格样式正常
* [ ] 提示块有样式
* [ ] 数学公式正常
* [ ] 图片自适应
* [ ] 移动端响应式正常

---

**测试完成 🎉**


---

如果你愿意，我可以帮你再生成一个：

- 🔥 专门针对 **Nextra** 的测试版  
- 🚀 专门针对 **VitePress** 的测试版  
- 🎨 极限压力测试版（专测样式崩不崩）

你只要说一声 👍
