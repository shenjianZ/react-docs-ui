/**
 * Claude (Anthropic) Provider
 */

import { BaseAIProvider } from './base'
import type { ChatMessage, StreamEvent, TestConnectionResult } from '../types'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeRequest {
  model: string
  messages: ClaudeMessage[]
  max_tokens: number
  system?: string
  temperature?: number
  stream: boolean
}

interface ClaudeStreamEvent {
  type: string
  index?: number
  delta?: {
    type: string
    text?: string
  }
  message?: {
    id: string
    role: string
    content: Array<{ type: string; text?: string }>
    model: string
  }
  error?: {
    type: string
    message: string
  }
}

export class ClaudeProvider extends BaseAIProvider {
  /**
   * 发送聊天消息（流式输出）
   */
  async chat(
    messages: ChatMessage[],
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `${this.config.baseUrl}/v1/messages`
    const headers = this.buildHeaders()
    const body = this.buildRequestBody(messages)

    onEvent({ type: 'start' })

    try {
      const response = await this.makeRequest(url, body, headers, signal)

      await this.readStream(response, onEvent, (chunk) => {
        this.parseStreamChunk(chunk, onEvent)
      })

      onEvent({ type: 'done' })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        onEvent({ type: 'error', error: '请求已取消' })
      } else {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        onEvent({ type: 'error', error: errorMessage })
      }
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<TestConnectionResult> {
    try {
      // Claude API 没有单独的模型列表接口，尝试发送一个简单的请求
      const url = `${this.config.baseUrl}/v1/messages`
      const headers = this.buildHeaders()

      // 发送最小请求测试
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.config.modelId,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
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

        return { success: false, message: errorMessage }
      }

      return {
        success: true,
        message: '连接成功',
        modelInfo: {
          id: this.config.modelId,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接失败'
      return { success: false, message: errorMessage }
    }
  }

  /**
   * 构建请求头
   */
  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }
  }

  /**
   * 构建请求体
   */
  protected buildRequestBody(messages: ChatMessage[]): ClaudeRequest {
    const formattedMessages: ClaudeMessage[] = []

    // 添加对话消息
    for (const msg of messages) {
      if (msg.role === 'system') continue

      // Claude 要求消息必须交替
      formattedMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    }

    // 确保 messages 不为空且以 user 消息结尾
    if (formattedMessages.length === 0 || formattedMessages[formattedMessages.length - 1].role !== 'user') {
      formattedMessages.push({
        role: 'user',
        content: '请继续',
      })
    }

    const request: ClaudeRequest = {
      model: this.config.modelId,
      messages: formattedMessages,
      max_tokens: this.config.maxTokens || 4096,
      stream: true,
    }

    // 系统提示词单独传递
    if (this.config.systemPrompt) {
      request.system = this.config.systemPrompt
    }

    if (this.config.temperature !== undefined) {
      request.temperature = this.config.temperature
    }

    return request
  }

  /**
   * 解析流式响应
   */
  protected parseStreamChunk(chunk: string, onEvent: (event: StreamEvent) => void): void {
    // Claude 使用不同的 SSE 格式
    const lines = chunk.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
        continue
      }

      const data = trimmedLine.slice(6)

      try {
        const event: ClaudeStreamEvent = JSON.parse(data)

        switch (event.type) {
          case 'content_block_delta':
            if (event.delta?.type === 'text_delta' && event.delta.text) {
              onEvent({ type: 'delta', content: event.delta.text })
            }
            break

          case 'message_delta':
            // 消息更新
            break

          case 'message_start':
            // 消息开始
            break

          case 'message_stop':
            onEvent({ type: 'done' })
            break

          case 'content_block_stop':
            // 内容块结束
            break

          case 'error':
            if (event.error) {
              onEvent({
                type: 'error',
                error: event.error.message || 'API错误',
              })
            }
            break

          case 'ping':
            // 心跳，忽略
            break
        }
      } catch {
        // 解析失败，忽略
      }
    }
  }
}
