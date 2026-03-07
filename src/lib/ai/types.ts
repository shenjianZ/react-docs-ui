/**
 * AI模块类型定义
 */

/** 单个模型配置 */
export interface AIModelConfig {
  /** 模型ID */
  modelId: string
  /** API密钥（加密存储） */
  apiKey: string
  /** API基础URL */
  baseUrl: string
  /** 最大输出token数 */
  maxTokens: number
  /** 温度参数 */
  temperature: number
  /** 是否启用 */
  enabled?: boolean
}

/** AI功能配置 */
export interface AIFeaturesConfig {
  /** 聊天助手 */
  chatAssistant: boolean
  /** 文档摘要 */
  documentSummary: boolean
  /** 代码解释 */
  codeExplanation: boolean
  /** 搜索增强 */
  searchEnhancement: boolean
}

/** AI UI配置 */
export interface AIUIConfig {
  /** 位置 */
  position: 'bottom-left' | 'bottom-center' | 'bottom-right'
  /** 主题 */
  theme: 'light' | 'dark' | 'auto'
  /** 尺寸 */
  size: 'small' | 'medium' | 'large'
}

/** 完整的AI配置 */
export interface AIConfig {
  /** 是否启用AI功能 */
  enabled: boolean
  /** 当前选中的提供商（可以是预定义的，也可以是自定义的名称，如 "deepseek"） */
  provider: string
  /** 系统提示词 */
  systemPrompt: string
  /** 各提供商的模型配置（支持动态添加自定义 Provider） */
  models: Record<string, AIModelConfig>
  /** 功能开关 */
  features: AIFeaturesConfig
  /** UI配置 */
  ui: AIUIConfig
}

/** 聊天消息角色 */
export type ChatMessageRole = 'user' | 'assistant' | 'system'

/** 聊天消息 */
export interface ChatMessage {
  /** 消息ID */
  id: string
  /** 角色 */
  role: ChatMessageRole
  /** 内容 */
  content: string
  /** 时间戳 */
  timestamp: number
  /** 是否正在生成（流式输出时使用） */
  isStreaming?: boolean
  /** 错误信息 */
  error?: string
}

/** 对话上下文 */
export interface ChatContext {
  /** 选中的文本 */
  selectedText?: string
  /** 当前页面标题 */
  pageTitle?: string
  /** 当前页面URL */
  pageUrl?: string
  /** 额外上下文 */
  extraContext?: string
}

/** 对话会话 */
export interface ChatSession {
  /** 会话ID */
  id: string
  /** 会话标题 */
  title: string
  /** 消息列表 */
  messages: ChatMessage[]
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 关联的上下文 */
  context?: ChatContext
}

/** 聊天选项 */
export interface ChatOptions {
  /** 使用的模型配置 */
  modelConfig?: AIModelConfig
  /** 温度覆盖 */
  temperature?: number
  /** 最大token覆盖 */
  maxTokens?: number
  /** 是否流式输出 */
  stream?: boolean
  /** 超时时间(ms)，默认60000 */
  timeout?: number
  /** 重试次数，默认3 */
  retryCount?: number
  /** 重试延迟(ms)，默认1000 */
  retryDelay?: number
}

/** AI Provider配置（内部使用） */
export interface AIProviderConfig {
  /** Provider类型 */
  type: string
  /** API密钥 */
  apiKey: string
  /** 基础URL */
  baseUrl: string
  /** 模型ID */
  modelId: string
  /** 系统提示词 */
  systemPrompt?: string
  /** 最大token */
  maxTokens?: number
  /** 温度 */
  temperature?: number
}

/** 流式响应事件 */
export interface StreamEvent {
  /** 事件类型 */
  type: 'start' | 'delta' | 'done' | 'error'
  /** 内容增量 */
  content?: string
  /** 错误信息 */
  error?: string
}

/** 测试连接结果 */
export interface TestConnectionResult {
  success: boolean
  message: string
  modelInfo?: {
    id: string
    name?: string
  }
}

/** AI状态 */
export interface AIState {
  /** 是否已配置 */
  isConfigured: boolean
  /** 当前配置 */
  config: AIConfig | null
  /** 当前会话 */
  currentSession: ChatSession | null
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
}