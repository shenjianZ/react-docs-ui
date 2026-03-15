# 📄 Document Rendering Test Page

> Used to test whether the documentation website correctly renders various Markdown / MDX features.

---

## 🧭 Table of Contents

- [Heading Test](#heading-test)
- [Text Styles](#text-styles)
- [Lists](#lists)
- [Code Blocks](#code-blocks)
- [Tables](#tables)
- [Quote Blocks](#quote-blocks)
- [Callout Blocks](#callout-blocks)
- [Images](#images)
- [Math Formulas](#math-formulas)
- [MDX Components (Optional)](#mdx-components-optional)

---

## Heading Test

### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

### TOC Heading Formatting Tests

#### Heading with `inlineCode`

#### Heading with **Bold**

#### Heading with *Italic*

#### Heading with ~~Strikethrough~~

#### Mixed **Bold** and `inlineCode` Heading

#### Mixed *Italic* and ~~Strikethrough~~ Heading

#### Mixed **Bold** *Italic* `inlineCode` ~~Strikethrough~~ Heading

#### Heading with [Link Text](https://example.com)

#### Chinese `Code` English **Bold** Mixed Heading

#### `create-react-docs-ui` and **site.yaml** Field Guide

---

## Text Styles

**Bold**

*Italic*

~~Strikethrough~~

`Inline code`

<kbd>Ctrl</kbd> + <kbd>C</kbd>

---

## Lists

### Unordered List

- Apple
- Banana
  - Sub-item 1
  - Sub-item 2
- Orange

### Ordered List

1. First step
2. Second step
3. Third step

### Task List

- [x] Completed
- [ ] Not completed

---

## Code Blocks

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

## Tables

| Feature | Supported | Notes |
| ---- | ---- | ----- |
| Headings | ✅ | Normal |
| Code Blocks | ✅ | Highlighted |
| Math Formulas | ⏳ | Depends on theme |

---

## Quote Blocks

> This is a quote block
> Used to test styles.

---

## Callout Blocks

> [!NOTE]
> This is a NOTE callout block (some themes support it)

> [!TIP]
> This is a TIP callout block

> [!WARNING]
> This is a WARNING callout block

---

## Images

![Sample Image](https://picsum.photos/800/400)
![01-image](/images/yrzx.png)

---

## Math Formulas

Inline formula:

$E = mc^2$

Block formula:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

---

## MDX Components (Optional)

If your documentation system supports MDX, you can test:

```jsx
export function Hello() {
  return <div style={{color: 'red'}}>Hello MDX!</div>
}
```

---

## 🔥 Collapsible Block (Some themes support)

<details>
<summary>Click to expand</summary>

This is the collapsed content.

</details>

---

## 🧪 Long Content Scroll Test

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

---

## ✅ Rendering Checklist

* [ ] Code highlighting works correctly
* [ ] Table styles are correct
* [ ] Callout blocks have styles
* [ ] Math formulas work correctly
* [ ] Images are responsive
* [ ] Mobile responsive works correctly

---

**Test Completed 🎉**

---

If you'd like, I can help you generate another one:

- 🔥 Specialized test version for **Nextra**
- 🚀 Specialized test version for **VitePress**
- 🎨 Extreme stress test version (specifically tests if styles break)

Just let me know 👍
