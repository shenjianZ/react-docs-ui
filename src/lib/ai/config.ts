/**
 * AI配置管理模块
 * 处理配置的读取、保存和加密存储
 */

import type { AIConfig, AIModelConfig } from './types'
import { encryptApiKey, decryptApiKey, isCryptoSupported, simpleEncrypt, simpleDecrypt } from './crypto'

/** 存储键名 */
const CONFIG_STORAGE_KEY = 'ai-config'

/** 预定义的 Provider 列表 */
const BUILTIN_PROVIDERS = ['openai', 'claude', 'gemini'] as const

/**
 * 获取默认模型配置
 */
export function getDefaultModelConfig(provider: string): AIModelConfig {
  const configs: Record<string, AIModelConfig> = {
    openai: {
      modelId: 'gpt-4o-mini',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    },
    claude: {
      modelId: 'claude-3-5-sonnet-20241022',
      apiKey: '',
      baseUrl: 'https://api.anthropic.com',
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    },
    gemini: {
      modelId: 'gemini-1.5-flash',
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    },
  }

  return configs[provider] || {
    modelId: '',
    apiKey: '',
    baseUrl: '',
    maxTokens: 4096,
    temperature: 0.7,
    enabled: true,
  }
}

/**
 * 获取默认AI配置
 */
export function getDefaultAIConfig(): AIConfig {
  const models: Record<string, AIModelConfig> = {
    openai: getDefaultModelConfig('openai'),
    claude: getDefaultModelConfig('claude'),
    gemini: getDefaultModelConfig('gemini'),
  }

  return {
    enabled: true,
    provider: 'openai',
    systemPrompt: '你是一个专业的文档助手，请根据用户的问题，提供准确、有帮助的回答。',
    models,
    features: {
      chatAssistant: true,
      documentSummary: true,
      codeExplanation: true,
      searchEnhancement: false,
    },
    ui: {
      position: 'bottom-right',
      theme: 'auto',
      size: 'medium',
    },
  }
}

/**
 * 加密模型配置中的API密钥
 */
async function encryptModelConfig(config: AIModelConfig): Promise<AIModelConfig> {
  if (!config.apiKey) {
    return config
  }

  const encryptedKey = isCryptoSupported()
    ? await encryptApiKey(config.apiKey)
    : simpleEncrypt(config.apiKey)

  return {
    ...config,
    apiKey: encryptedKey,
  }
}

/**
 * 解密模型配置中的API密钥
 */
async function decryptModelConfig(config: AIModelConfig): Promise<AIModelConfig> {
  if (!config.apiKey) {
    return config
  }

  const decryptedKey = isCryptoSupported()
    ? await decryptApiKey(config.apiKey)
    : simpleDecrypt(config.apiKey)

  return {
    ...config,
    apiKey: decryptedKey,
  }
}

/**
 * 保存AI配置到localStorage
 * API密钥会被加密后存储
 */
export async function saveAIConfig(config: AIConfig): Promise<void> {
  try {
    // 加密所有模型配置中的API密钥
    const encryptedModels: Record<string, AIModelConfig> = {}

    for (const [provider, modelConfig] of Object.entries(config.models)) {
      encryptedModels[provider] = await encryptModelConfig(modelConfig)
    }

    const configToSave: AIConfig = {
      ...config,
      models: encryptedModels,
    }

    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave))
  } catch (error) {
    console.error('Failed to save AI config:', error)
    throw new Error('保存配置失败')
  }
}

/**
 * 从localStorage读取AI配置
 * API密钥会被解密后返回
 */
export async function getAIConfig(): Promise<AIConfig | null> {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (!stored) {
      return null
    }

    const config: AIConfig = JSON.parse(stored)

    // 解密所有模型配置中的API密钥
    const decryptedModels: Record<string, AIModelConfig> = {}

    for (const [provider, modelConfig] of Object.entries(config.models)) {
      decryptedModels[provider] = await decryptModelConfig(modelConfig)
    }

    const result: AIConfig = {
      enabled: config.enabled !== false, // 默认为 true
      provider: config.provider || 'openai',
      systemPrompt: config.systemPrompt || '',
      models: decryptedModels,
      features: config.features || {
        chatAssistant: true,
        documentSummary: true,
        codeExplanation: true,
        searchEnhancement: false,
      },
      ui: config.ui || {
        position: 'bottom-right',
        theme: 'auto',
        size: 'medium',
      },
    }

    // 如果当前 provider 没有配置，自动切换到第一个已配置的 provider
    if (!result.models[result.provider]?.apiKey) {
      const configuredProvider = Object.keys(result.models).find(
        p => result.models[p]?.apiKey
      )
      if (configuredProvider) {
        result.provider = configuredProvider
        // 保存更新后的配置
        await saveAIConfig(result)
      }
    }

    return result
  } catch (error) {
    console.error('Failed to read AI config:', error)
    return null
  }
}

/**
 * 检查AI是否已配置（是否有有效的API密钥）
 */
export async function isAIConfigured(): Promise<boolean> {
  const config = await getAIConfig()
  if (!config || !config.enabled) {
    return false
  }

  const providerConfig = config.models[config.provider]
  return !!(providerConfig?.apiKey && providerConfig?.modelId)
}

/**
 * 检查指定 Provider 是否已配置
 */
export async function isProviderConfigured(provider: string): Promise<boolean> {
  const config = await getAIConfig()
  if (!config || !config.enabled) {
    return false
  }

  const providerConfig = config.models[provider]
  return !!(providerConfig?.apiKey && providerConfig?.modelId)
}

/**
 * 获取当前 Provider 的配置
 */
export async function getCurrentProviderConfig(config?: AIConfig): Promise<AIModelConfig | null> {
  const aiConfig = config || await getAIConfig()
  if (!aiConfig) {
    return null
  }

  return aiConfig.models[aiConfig.provider] || null
}

/**
 * 更新单个提供商的配置
 */
export async function updateProviderConfig(
  provider: string,
  updates: Partial<AIModelConfig>
): Promise<void> {
  const config = await getAIConfig() || getDefaultAIConfig()

  config.models[provider] = {
    ...config.models[provider],
    ...updates,
  }

  await saveAIConfig(config)
}

/**
 * 删除自定义 Provider
 */
export async function deleteProvider(provider: string): Promise<void> {
  const config = await getAIConfig()
  if (!config) {
    return
  }

  // 不能删除预定义的 Provider
  if (BUILTIN_PROVIDERS.includes(provider as any)) {
    throw new Error('不能删除预定义的 Provider')
  }

  const newModels = { ...config.models }
  delete newModels[provider]

  // 如果删除的是当前选中的 Provider，切换到默认 Provider
  const newProvider = config.provider === provider ? 'openai' : config.provider

  await saveAIConfig({
    ...config,
    models: newModels,
    provider: newProvider,
  })
}

/**
 * 清除AI配置
 */
export function clearAIConfig(): void {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear AI config:', error)
  }
}

/**
 * 验证API配置是否有效
 */
export function validateModelConfig(config: AIModelConfig): { valid: boolean; message: string } {
  if (!config.apiKey) {
    return { valid: false, message: 'API密钥不能为空' }
  }

  if (!config.modelId) {
    return { valid: false, message: '模型ID不能为空' }
  }

  if (!config.baseUrl) {
    return { valid: false, message: 'API地址不能为空' }
  }

  // 验证URL格式
  try {
    new URL(config.baseUrl)
  } catch {
    return { valid: false, message: 'API地址格式不正确' }
  }

  return { valid: true, message: '' }
}

/**
 * 导出配置（不包含API密钥）
 */
export async function exportAIConfig(): Promise<Partial<AIConfig>> {
  const config = await getAIConfig()
  if (!config) {
    return {}
  }

  // 移除API密钥
  const exported: Partial<AIConfig> = {
    ...config,
    models: {},
  }

  for (const [provider, modelConfig] of Object.entries(config.models)) {
    exported.models![provider] = {
      ...modelConfig,
      apiKey: '', // 不导出API密钥
    }
  }

  return exported
}

/**
 * 获取所有 Provider 列表（包括自定义）
 */
export async function getAllProviders(): Promise<string[]> {
  const config = await getAIConfig()
  if (!config) {
    return [...BUILTIN_PROVIDERS]
  }

  const customProviders = Object.keys(config.models).filter(
    p => !BUILTIN_PROVIDERS.includes(p as any)
  )

  return [...BUILTIN_PROVIDERS, ...customProviders]
}