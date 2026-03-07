/**
 * OpenAI 兼容 Provider
 * 支持 OpenAI、DeepSeek、通义千问等兼容 API
 */

import { BaseAIProvider } from './base'
import type { ChatMessage, StreamEvent, TestConnectionResult } from '../types'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  max_tokens?: number
  temperature?: number
  stream: boolean
}

interface OpenAIStreamResponse {
  id: string
  object: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

export class OpenAIProvider extends BaseAIProvider {
  /**
   * 发送聊天消息（流式输出）
   */
  async chat(
    messages: ChatMessage[],
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `${this.config.baseUrl}/chat/completions`
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
      const url = `${this.config.baseUrl}/models`
      const headers = this.buildHeaders()

      const response = await fetch(url, {
        method: 'GET',
        headers,
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

      const data = await response.json()

      // 检查配置的模型是否可用
      const models: Array<{ id?: string }> = data.data || data.models || []
      const targetModel = models.find(
        (m) => m.id === this.config.modelId || m.id?.includes(this.config.modelId)
      )

      return {
        success: true,
        message: '连接成功',
        modelInfo: {
          id: this.config.modelId,
          name: targetModel?.id || this.config.modelId,
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
      'Authorization': `Bearer ${this.config.apiKey}`,
    }
  }

  /**
   * 构建请求体
   */
  protected buildRequestBody(messages: ChatMessage[]): OpenAIRequest {
    const formattedMessages: OpenAIMessage[] = []

    // 添加系统消息
    if (this.config.systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: this.config.systemPrompt,
      })
    }

    // 添加对话消息
    for (const msg of messages) {
      if (msg.role === 'system') continue
      formattedMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    }

    return {
      model: this.config.modelId,
      messages: formattedMessages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      stream: true,
    }
  }

  /**
   * 解析流式响应
   */
  protected parseStreamChunk(chunk: string, onEvent: (event: StreamEvent) => void): void {
    // 处理 SSE 格式
    const lines = chunk.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
        continue
      }

      const data = trimmedLine.slice(6) // 移除 'data: ' 前缀

      if (data === '[DONE]') {
        onEvent({ type: 'done' })
        return
      }

      try {
        const parsed: OpenAIStreamResponse = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content

        if (content) {
          onEvent({ type: 'delta', content })
        }

        // 检查是否结束
        if (parsed.choices?.[0]?.finish_reason === 'stop') {
          onEvent({ type: 'done' })
        }
      } catch {
        // 解析失败，忽略
      }
    }
  }
}
