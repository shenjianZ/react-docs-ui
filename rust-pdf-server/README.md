# Rust PDF Server

低内存占用的 PDF 生成服务（10-50MB）

## 内存占用

| 状态 | 内存 |
|------|------|
| 空闲 | ~5-10 MB |
| 生成 PDF | ~20-50 MB |

## 本地编译

```bash
# 需要安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 编译
cargo build --release

# 运行
./target/release/react-docs-pdf-server
```

## Docker 部署

```bash
docker compose up -d
```

## API

### 健康检查
```
GET /health
```

### 生成 PDF
```
POST /generate-pdf
Content-Type: application/json

{
  "content": "# Title\n\nParagraph...",
  "title": "Document Title",
  "filename": "document.pdf"
}
```

或通过 URL 获取内容：
```json
{
  "url": "https://example.com/page",
  "filename": "page.pdf"
}
```

## 与 Puppeteer 版本对比

| 特性 | Rust | Puppeteer |
|------|------|-----------|
| 内存占用 | 10-50 MB | 300-500 MB |
| 样式还原 | ⭐⭐ 基础 | ⭐⭐⭐⭐⭐ 完美 |
| 中文支持 | ✅ 有限 | ✅ 完美 |
| 表格支持 | ✅ 基础 | ✅ 完美 |
| 部署大小 | ~10 MB | ~300 MB |

## 限制

- 不支持复杂 CSS 样式
- 不支持 JavaScript 渲染
- 中文字体支持有限（需要额外配置）
- 不支持图片嵌入

## 适用场景

- 简单文档导出
- 内存受限环境
- 纯文本/Markdown 内容
