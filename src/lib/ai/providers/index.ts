/**
 * AI Provider 工厂
 */

import type { AIProviderConfig } from '../types'
import { BaseAIProvider } from './base'
import { OpenAIProvider } from './openai'
import { ClaudeProvider } from './claude'
import { GeminiProvider } from './gemini'

export { BaseAIProvider } from './base'
export { OpenAIProvider } from './openai'
export { ClaudeProvider } from './claude'
export { GeminiProvider } from './gemini'

/**
 * 预定义的 Provider 列表
 */
const BUILTIN_PROVIDERS = ['openai', 'claude', 'gemini'] as const
type BuiltinProvider = typeof BUILTIN_PROVIDERS[number]

const isBuiltinProvider = (provider: string): provider is BuiltinProvider => {
  return BUILTIN_PROVIDERS.includes(provider as BuiltinProvider)
}

/**
 * 创建 AI Provider 实例
 * 对于预定义的 Provider，使用对应的实现
 * 对于自定义 Provider，默认使用 OpenAI 兼容格式
 */
export function createAIProvider(
  providerName: string,
  config: AIProviderConfig
): BaseAIProvider {
  if (isBuiltinProvider(providerName)) {
    switch (providerName) {
      case 'openai':
        return new OpenAIProvider(config)

      case 'claude':
        return new ClaudeProvider(config)

      case 'gemini':
        return new GeminiProvider(config)
    }
  }

  // 自定义 Provider 默认使用 OpenAI 兼容格式
  return new OpenAIProvider(config)
}

/**
 * 获取 Provider 显示名称
 */
export function getProviderDisplayName(providerName: string): string {
  if (!providerName) {
    return 'Unknown'
  }

  const names: Record<string, string> = {
    openai: 'OpenAI',
    claude: 'Claude (Anthropic)',
    gemini: 'Google Gemini',
  }

  // 预定义的 Provider 使用预定义名称
  if (providerName in names) {
    return names[providerName]
  }

  // 自定义 Provider，将名称格式化（首字母大写）
  return providerName.charAt(0).toUpperCase() + providerName.slice(1)
}

/**
 * 获取 Provider 默认模型列表
 */
export function getProviderDefaultModels(providerName: string): string[] {
  if (!providerName) {
    return []
  }

  const models: Record<string, string[]> = {
    openai: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ],
    claude: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
    gemini: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.0-pro',
    ],
  }

  // 预定义的 Provider 返回预定义模型列表
  if (providerName in models) {
    return models[providerName]
  }

  // 自定义 Provider 返回空数组
  return []
}

/**
 * 获取 Provider 帮助信息
 */
export function getProviderHelpInfo(providerName: string): {
  apiKeyUrl: string
  docsUrl: string
} {
  if (!providerName) {
    return {
      apiKeyUrl: '',
      docsUrl: '',
    }
  }

  const info: Record<string, { apiKeyUrl: string; docsUrl: string }> = {
    openai: {
      apiKeyUrl: 'https://platform.openai.com/api-keys',
      docsUrl: 'https://platform.openai.com/docs',
    },
    claude: {
      apiKeyUrl: 'https://console.anthropic.com/settings/keys',
      docsUrl: 'https://docs.anthropic.com',
    },
    gemini: {
      apiKeyUrl: 'https://aistudio.google.com/apikey',
      docsUrl: 'https://ai.google.dev/docs',
    },
  }

  // 预定义的 Provider 返回预定义帮助信息
  if (providerName in info) {
    return info[providerName]
  }

  // 自定义 Provider 返回空帮助信息
  return {
    apiKeyUrl: '',
    docsUrl: '',
  }
}