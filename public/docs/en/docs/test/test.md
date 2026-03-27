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

Default block images:

![Sample Image](https://picsum.photos/800/400)
![01-image](/images/og-default.png)
![success-icon](/images/success.svg)

Control size and disable preview:

![Small success-icon, preview off](/images/success.svg "width=24 preview=false")

Control size and keep preview:

![Small success-icon, preview on](/images/success.svg "size=24 preview=true")

Inline icon example:

Status normal ![Inline success-icon](/images/success.svg "width=18 inline=true preview=false") completed

Inline icon with preview:

Click to view ![Inline preview icon](/images/success.svg "width=18 inline=true preview=true") large image

Inline icon offset examples:

Default position: status normal ![Default icon](/images/success.svg "width=18 inline=true preview=false")

Move down by 3px: status normal ![Shift down icon](/images/success.svg "width=18 inline=true preview=false y=3")

Move right 4px and up 2px: status normal ![Offset icon](/images/success.svg "width=18 inline=true preview=false x=4 y=-2")

Use HTML `img` to control size and preview:

<img src="/images/success.svg" alt="HTML icon" width="24" data-preview="false" />
<img src="/images/og-default.png" alt="HTML custom sized image" width="320" data-preview="true" />

Use HTML `img` for inline rendering:

HTML inline icon: <img src="/images/success.svg" alt="HTML inline icon" width="18" data-inline="true" data-preview="false" /> current status normal

HTML inline offset icon: <img src="/images/success.svg" alt="HTML offset icon" width="18" data-inline="true" data-preview="false" data-offset-x="4" data-offset-y="-2" /> current status normal

Image syntax notes:

- `width=24` or `height=24`: set image size
- `size=24`: set both width and height
- `preview=false`: disable image preview
- `preview=true`: enable image preview
- `inline=true`: render as inline element instead of a full block
- `x=4`, `y=-2`: adjust horizontal and vertical offset
- HTML `<img>` supports `width`, `height`, `data-preview`, `data-inline`, `data-offset-x`, `data-offset-y`

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
