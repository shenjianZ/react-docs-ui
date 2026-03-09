FROM rust:1.75-alpine AS builder

WORKDIR /app

RUN apk add --no-cache musl-dev

COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates && \
    adduser -D -u 1000 appuser

COPY --from=builder /app/target/release/react-docs-pdf-server /app/

USER appuser

EXPOSE 6965

ENV PDF_SERVER_PORT=6965

CMD ["./react-docs-pdf-server"]
