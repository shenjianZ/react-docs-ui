/**
 * AI Provider 基础抽象类
 */

import type { ChatMessage, AIProviderConfig, StreamEvent, TestConnectionResult } from '../types'

export abstract class BaseAIProvider {
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  /**
   * 发送聊天消息（流式输出）
   */
  abstract chat(
    messages: ChatMessage[],
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void>

  /**
   * 测试连接
   */
  abstract testConnection(): Promise<TestConnectionResult>

  /**
   * 验证配置
   */
  validateConfig(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.baseUrl &&
      this.config.modelId
    )
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AIProviderConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 构建请求头
   */
  protected abstract buildHeaders(): Record<string, string>

  /**
   * 构建请求体
   */
  protected abstract buildRequestBody(messages: ChatMessage[]): unknown

  /**
   * 解析流式响应
   */
  protected abstract parseStreamChunk(chunk: string, onEvent: (event: StreamEvent) => void): void

  /**
   * 生成消息ID
   */
  protected generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 格式化消息（移除不必要的字段）
   */
  protected formatMessages(messages: ChatMessage[]): Array<{ role: string; content: string }> {
    return messages
      .filter(m => m.role !== 'system') // 系统消息单独处理
      .map(m => ({
        role: m.role,
        content: m.content,
      }))
  }

  /**
   * 发起HTTP请求
   */
  protected async makeRequest(
    url: string,
    body: unknown,
    headers: Record<string, string>,
    signal?: AbortSignal
  ): Promise<Response> {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}`

      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage
      } catch {
        // 使用默认错误消息
      }

      throw new Error(errorMessage)
    }

    return response
  }

  /**
   * 读取流式响应
   */
  protected async readStream(
    response: Response,
    _onEvent: (event: StreamEvent) => void,
    parseChunk: (chunk: string) => void
  ): Promise<void> {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // 处理剩余缓冲区
          if (buffer.trim()) {
            parseChunk(buffer)
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // 按行分割处理
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.trim()) {
            parseChunk(line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}
