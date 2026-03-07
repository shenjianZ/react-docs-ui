/**
 * AI 模块入口
 */

// 类型导出
export type {
  AIModelConfig,
  AIFeaturesConfig,
  AIUIConfig,
  AIConfig,
  ChatMessageRole,
  ChatMessage,
  ChatContext,
  ChatSession,
  ChatOptions,
  AIProviderConfig,
  StreamEvent,
  TestConnectionResult,
  AIState,
} from './types'

// 配置相关
export {
  getDefaultModelConfig,
  getDefaultAIConfig,
  saveAIConfig,
  getAIConfig,
  isAIConfigured,
  isProviderConfigured,
  getCurrentProviderConfig,
  updateProviderConfig,
  deleteProvider,
  clearAIConfig,
  validateModelConfig,
  exportAIConfig,
  getAllProviders,
} from './config'

// 加密相关
export {
  encryptApiKey,
  decryptApiKey,
  isCryptoSupported,
} from './crypto'

// Provider 相关
export {
  createAIProvider,
  getProviderDisplayName,
  getProviderDefaultModels,
  getProviderHelpInfo,
} from './providers'

// 对话相关
export {
  buildContextMessage,
  buildSystemPrompt,
  sendChatMessage,
  testAIConnection,
  generateMessageId,
  createUserMessage,
  createAssistantMessage,
  updateAssistantMessage,
} from './chat'
