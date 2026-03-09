# PDF Server Deployment

React Docs UI provides a PDF generation service that can be deployed as a standalone Docker container.

## Pull Image

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/pull-image/react-docs-pdf-server:latest
```

## Run Container

### Using Docker Command

```bash
docker run -d \
  --name pdf-server \
  --memory=512m \
  -p 6965:6965 \
  registry.cn-hangzhou.aliyuncs.com/pull-image/react-docs-pdf-server:latest
```

### Using Docker Compose

Create `docker-compose.yml` file:

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

Start service:

```bash
docker-compose up -d
```

## Verify Service

```bash
# Health check
curl http://localhost:6965/health

# Response example
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/generate-pdf` | POST | Generate PDF (returns file) |
| `/generate-pdf-sync` | POST | Generate PDF (returns Base64) |

### Generate PDF Example

```bash
curl -X POST http://localhost:6965/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "filename": "document.pdf"}' \
  --output document.pdf
```

## Resource Configuration

PDF Server runs on Puppeteer/Chromium, recommended configuration:

| Scenario | Recommended Memory |
|----------|-------------------|
| Low concurrency (1-2 requests) | 512MB |
| Medium concurrency | 1GB |
| High concurrency | 2GB+ |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PDF_SERVER_PORT` | 3001 | Server port (Docker image default: 6965) |
