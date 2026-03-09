# PDF Server 部署

React Docs UI 提供了 PDF 生成服务，可以独立部署为 Docker 容器。

## 拉取镜像

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/pull-image/react-docs-pdf-server:latest
```

## 运行容器

### 使用 Docker 命令

```bash
docker run -d \
  --name pdf-server \
  --memory=512m \
  -p 6965:6965 \
  registry.cn-hangzhou.aliyuncs.com/pull-image/react-docs-pdf-server:latest
```

### 使用 Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
services:
  pdf-server:
    image: registry.cn-hangzhou.aliyuncs.com/pull-image/react-docs-pdf-server:latest
    container_name: pdf-server
    mem_limit: 512m
    ports:
      - "6965:6965"
    restart: unless-stopped
```

启动服务：

```bash
docker-compose up -d
```

## 验证服务

```bash
# 健康检查
curl http://localhost:6965/health

# 响应示例
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/generate-pdf` | POST | 生成 PDF（返回文件） |
| `/generate-pdf-sync` | POST | 生成 PDF（返回 Base64） |

### 生成 PDF 示例

```bash
curl -X POST http://localhost:6965/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "filename": "document.pdf"}' \
  --output document.pdf
```

## 资源配置

PDF Server 基于 Puppeteer/Chromium 运行，建议配置：

| 场景 | 推荐内存 |
|------|---------|
| 低并发（1-2 请求） | 512MB |
| 中等并发 | 1GB |
| 高并发 | 2GB+ |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PDF_SERVER_PORT` | 3001 | 服务端口（Docker 镜像默认 6965） |
