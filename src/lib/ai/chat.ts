/**
 * AI 对话统一接口
 */

import type { AIConfig, ChatMessage, ChatContext, StreamEvent, TestConnectionResult, AIProviderConfig, AIModelConfig } from './types'
import { getAIConfig, getCurrentProviderConfig } from './config'
import { createAIProvider } from './providers'

/**
 * 构建包含上下文的消息
 */
export function buildContextMessage(
  userMessage: string,
  context?: ChatContext
): string {
  if (!context) {
    return userMessage
  }

  const parts: string[] = []

  // 添加选中上下文
  if (context.selectedText) {
    parts.push(`【选中的内容】\n${context.selectedText}\n`)
  }

  // 添加页面信息
  if (context.pageTitle) {
    parts.push(`【当前页面】${context.pageTitle}`)
  }

  // 添加用户消息
  parts.push(userMessage)

  return parts.join('\n')
}

/**
 * 构建系统提示词
 */
export function buildSystemPrompt(
  basePrompt: string,
  context?: ChatContext
): string {
  if (!context) {
    return basePrompt
  }

  const parts: string[] = [basePrompt]

  // 添加额外的上下文说明
  if (context.selectedText) {
    parts.push('\n用户选中了文章中的部分内容，请基于选中的内容回答问题。')
  }

  if (context.extraContext) {
    parts.push(`\n${context.extraContext}`)
  }

  return parts.join('')
}

/**
 * 发送聊天消息
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  onEvent: (event: StreamEvent) => void,
  config?: AIConfig,
  context?: ChatContext,
  signal?: AbortSignal
): Promise<void> {
  // 获取配置
  const aiConfig = config || await getAIConfig()

  if (!aiConfig || !aiConfig.enabled) {
    onEvent({ type: 'error', error: 'AI功能未启用' })
    return
  }

  const modelConfig = await getCurrentProviderConfig(aiConfig)

  if (!modelConfig?.apiKey) {
    onEvent({ type: 'error', error: '请先配置API密钥' })
    return
  }

  // 构建 Provider 配置
  const providerConfig: AIProviderConfig = {
    type: aiConfig.provider,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
    modelId: modelConfig.modelId,
    systemPrompt: buildSystemPrompt(aiConfig.systemPrompt, context),
    maxTokens: modelConfig.maxTokens,
    temperature: modelConfig.temperature,
  }

  // 创建 Provider
  const provider = createAIProvider(aiConfig.provider, providerConfig)

  // 发送消息
  await provider.chat(messages, onEvent, signal)
}

/**
 * 测试连接
 */
export async function testAIConnection(
  providerType: AIConfig['provider'],
  modelConfig: AIModelConfig,
  systemPrompt?: string
): Promise<TestConnectionResult> {
  if (!modelConfig.apiKey) {
    return { success: false, message: 'API密钥不能为空' }
  }

  const providerConfig: AIProviderConfig = {
    type: providerType,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
    modelId: modelConfig.modelId,
    systemPrompt: systemPrompt || '',
    maxTokens: modelConfig.maxTokens,
    temperature: modelConfig.temperature,
  }

  const provider = createAIProvider(providerType, providerConfig)

  return provider.testConnection()
}

/**
 * 生成消息ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 创建用户消息
 */
export function createUserMessage(content: string): ChatMessage {
  return {
    id: generateMessageId(),
    role: 'user',
    content,
    timestamp: Date.now(),
  }
}

/**
 * 创建助手消息
 */
export function createAssistantMessage(content: string = ''): ChatMessage {
  return {
    id: generateMessageId(),
    role: 'assistant',
    content,
    timestamp: Date.now(),
    isStreaming: true,
  }
}

/**
 * 更新助手消息内容
 */
export function updateAssistantMessage(
  message: ChatMessage,
  content: string,
  isStreaming: boolean = false,
  error?: string
): ChatMessage {
  return {
    ...message,
    content,
    isStreaming,
    error,
  }
}
