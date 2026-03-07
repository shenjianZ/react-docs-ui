/**
 * Google Gemini Provider
 */

import { BaseAIProvider } from './base'
import type { ChatMessage, StreamEvent, TestConnectionResult } from '../types'

interface GeminiContent {
  parts: Array<{
    text?: string
  }>
  role: 'user' | 'model'
}

interface GeminiRequest {
  contents: GeminiContent[]
  generationConfig: {
    maxOutputTokens?: number
    temperature?: number
    topP?: number
    topK?: number
  }
  systemInstruction?: {
    parts: Array<{ text: string }>
  }
}

interface GeminiStreamResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string
      }>
      role: string
    }
    finishReason?: string
  }>
  error?: {
    code: number
    message: string
    status: string
  }
}

export class GeminiProvider extends BaseAIProvider {
  /**
   * 发送聊天消息（流式输出）
   */
  async chat(
    messages: ChatMessage[],
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = this.buildStreamUrl()
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
      const url = this.buildGenerateContentUrl()

      // 发送最小请求测试
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'hi' }],
            role: 'user',
          }],
          generationConfig: {
            maxOutputTokens: 1,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}`

        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorMessage
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
   * 构建流式请求URL
   */
  private buildStreamUrl(): string {
    return `${this.config.baseUrl}/models/${this.config.modelId}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`
  }

  /**
   * 构建非流式请求URL
   */
  private buildGenerateContentUrl(): string {
    return `${this.config.baseUrl}/models/${this.config.modelId}:generateContent?key=${this.config.apiKey}`
  }

  /**
   * 构建请求头
   */
  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    }
  }

  /**
   * 构建请求体
   */
  protected buildRequestBody(messages: ChatMessage[]): GeminiRequest {
    const contents: GeminiContent[] = []

    // 转换消息格式
    for (const msg of messages) {
      if (msg.role === 'system') continue

      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }

    const request: GeminiRequest = {
      contents,
      generationConfig: {
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      },
    }

    // 系统提示词
    if (this.config.systemPrompt) {
      request.systemInstruction = {
        parts: [{ text: this.config.systemPrompt }],
      }
    }

    return request
  }

  /**
   * 解析流式响应
   */
  protected parseStreamChunk(chunk: string, onEvent: (event: StreamEvent) => void): void {
    // Gemini 的 SSE 格式
    const lines = chunk.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
        continue
      }

      const data = trimmedLine.slice(6)

      try {
        const response: GeminiStreamResponse = JSON.parse(data)

        // 检查错误
        if (response.error) {
          onEvent({
            type: 'error',
            error: response.error.message || 'API错误',
          })
          return
        }

        // 提取内容
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0]

          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.text) {
                onEvent({ type: 'delta', content: part.text })
              }
            }
          }

          // 检查是否结束
          if (candidate.finishReason === 'STOP' || candidate.finishReason === 'MAX_TOKENS') {
            onEvent({ type: 'done' })
          }
        }
      } catch {
        // 解析失败，忽略
      }
    }
  }
}
