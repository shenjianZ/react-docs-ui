# PDF Server Docker 部署指南

## 内存占用

| 状态 | 内存占用 |
|------|---------|
| 空闲 | ~150-200 MB |
| 生成 PDF | ~300-500 MB |
| 峰值 | ~800 MB - 1 GB |

建议分配 **1GB** 内存限制。

## 快速部署

```bash
cd docker/pdf-server
docker compose up -d
```

## 验证服务

```bash
curl http://localhost:6965/health
# 返回: {"status":"ok","timestamp":"..."}
```

## 测试 PDF 生成

```bash
curl -X POST http://localhost:6965/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/docs", "filename": "test.pdf"}' \
  --output test.pdf
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PDF_SERVER_PORT | 6965 | 服务端口 |
| NODE_ENV | production | 运行环境 |

## 生产部署建议

### 1. 资源限制
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1'
```

### 2. 反向代理 (Nginx)
```nginx
location /pdf-server/ {
    proxy_pass http://127.0.0.1:6965/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 3. 安全配置
- 限制访问 IP
- 添加认证
- 使用 HTTPS

## 常用命令

```bash
# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新镜像
docker compose build --no-cache
docker compose up -d
```
