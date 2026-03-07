/**
 * AI Context Provider
 * 提供AI状态管理和对话功能
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { AIConfig, ChatMessage, ChatContext, ChatSession, StreamEvent } from '../../lib/ai/types'
import {
  getAIConfig,
  saveAIConfig,
  isAIConfigured,
  sendChatMessage,
  createUserMessage,
  createAssistantMessage,
  updateAssistantMessage,
  buildContextMessage,
} from '../../lib/ai'

/** 存储键名 */
const CURRENT_SESSION_KEY = 'ai-current-session'

interface AIContextValue {
  // 配置状态
  config: AIConfig | null
  isConfigured: boolean
  isLoading: boolean
  error: string | null

  // 会话状态
  currentSession: ChatSession | null
  messages: ChatMessage[]

  // 对话上下文
  selectedText: string
  setSelectedText: (text: string) => void

  // 对话框状态
  isDialogOpen: boolean
  openDialog: (context?: ChatContext) => void
  closeDialog: () => void

  // 设置面板状态
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void

  // 操作方法
  sendMessage: (content: string) => Promise<void>
  regenerateLast: () => Promise<void>
  clearHistory: () => void
  updateConfig: (config: Partial<AIConfig>) => Promise<void>
  switchProvider: (provider: AIConfig['provider']) => Promise<void>
  stopGeneration: () => void
}

const AIContext = createContext<AIContextValue | null>(null)

interface AIProviderProps {
  children: React.ReactNode
}

export function AIProvider({ children }: AIProviderProps) {
  // 配置状态
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  // 加载状态
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 会话状态
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // 对话上下文
  const [selectedText, setSelectedText] = useState('')
  const [chatContext, setChatContext] = useState<ChatContext | undefined>()

  // 对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // AbortController 引用
  const abortControllerRef = useRef<AbortController | null>(null)

  // 初始化加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await getAIConfig()
        setConfig(savedConfig)

        const configured = await isAIConfigured()
        setIsConfigured(configured)

        // 加载保存的会话
        loadCurrentSession()
      } catch (err) {
        console.error('[AI] 加载 AI 配置失败:', err)
      }
    }

    loadConfig()
  }, [])

  // 加载当前会话
  const loadCurrentSession = useCallback(() => {
    try {
      const saved = localStorage.getItem(CURRENT_SESSION_KEY)
      if (saved) {
        const session: ChatSession = JSON.parse(saved)
        setCurrentSession(session)
        setMessages(session.messages)
      }
    } catch {
      // 忽略错误
    }
  }, [])

  // 保存当前会话
  const saveCurrentSession = useCallback((msgs: ChatMessage[]) => {
    try {
      const session: ChatSession = currentSession || {
        id: `session_${Date.now()}`,
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const updatedSession: ChatSession = {
        ...session,
        messages: msgs,
        updatedAt: Date.now(),
        title: msgs[0]?.content?.slice(0, 50) || session.title,
      }

      setCurrentSession(updatedSession)
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(updatedSession))
    } catch {
      // 忽略错误
    }
  }, [currentSession])

  // 打开对话框
  const openDialog = useCallback((context?: ChatContext) => {
    if (context) {
      setChatContext(context)
      setSelectedText(context.selectedText || '')
    }
    setIsDialogOpen(true)
  }, [])

  // 关闭对话框
  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  // 打开设置
  const openSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  // 关闭设置
  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!config || isLoading) return

    // 构建用户消息
    const fullContent = buildContextMessage(content, chatContext)
    const userMessage = createUserMessage(fullContent)

    // 创建助手消息占位
    const assistantMessage = createAssistantMessage()

    const newMessages = [...messages, userMessage, assistantMessage]
    setMessages(newMessages)
    setIsLoading(true)
    setError(null)

    // 创建 AbortController
    abortControllerRef.current = new AbortController()

    // 当前助手消息内容
    let currentContent = ''

    try {
      await sendChatMessage(
        messages.concat(userMessage),
        (event: StreamEvent) => {
          switch (event.type) {
            case 'delta':
              if (event.content) {
                currentContent += event.content
                setMessages(prev => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                    updated[lastIndex] = updateAssistantMessage(
                      updated[lastIndex],
                      currentContent,
                      true
                    )
                  }
                  return updated
                })
              }
              break

            case 'done':
              setMessages(prev => {
                const updated = [...prev]
                const lastIndex = updated.length - 1
                if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                  updated[lastIndex] = updateAssistantMessage(
                    updated[lastIndex],
                    currentContent,
                    false
                  )
                }
                saveCurrentSession(updated)
                return updated
              })
              break

            case 'error':
              setError(event.error || '发生错误')
              setMessages(prev => {
                const updated = [...prev]
                const lastIndex = updated.length - 1
                if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                  updated[lastIndex] = updateAssistantMessage(
                    updated[lastIndex],
                    currentContent,
                    false,
                    event.error
                  )
                }
                return updated
              })
              break
          }
        },
        config ?? undefined,
        chatContext,
        abortControllerRef.current.signal
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送失败'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [config, messages, isLoading, chatContext, saveCurrentSession])

  // 重新生成最后一条回复
  const regenerateLast = useCallback(async () => {
    if (messages.length < 2 || isLoading) return

    // 移除最后一条助手消息
    const messagesWithoutLast = messages.slice(0, -1)
    setMessages(messagesWithoutLast)

    // 重新发送最后一条用户消息
    const lastUserMessage = messagesWithoutLast.filter(m => m.role === 'user').pop()
    if (lastUserMessage) {
      // 创建新的助手消息占位
      const assistantMessage = createAssistantMessage()
      setMessages([...messagesWithoutLast, assistantMessage])
      setIsLoading(true)

      abortControllerRef.current = new AbortController()
      let currentContent = ''

      try {
        await sendChatMessage(
          messagesWithoutLast,
          (event: StreamEvent) => {
            switch (event.type) {
              case 'delta':
                if (event.content) {
                  currentContent += event.content
                  setMessages(prev => {
                    const updated = [...prev]
                    const lastIndex = updated.length - 1
                    if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                      updated[lastIndex] = updateAssistantMessage(
                        updated[lastIndex],
                        currentContent,
                        true
                      )
                    }
                    return updated
                  })
                }
                break

              case 'done':
                setMessages(prev => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                    updated[lastIndex] = updateAssistantMessage(
                      updated[lastIndex],
                      currentContent,
                      false
                    )
                  }
                  saveCurrentSession(updated)
                  return updated
                })
                break

              case 'error':
                setError(event.error || '发生错误')
                break
            }
          },
          config ?? undefined,
          chatContext,
          abortControllerRef.current.signal
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '重新生成失败'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    }
  }, [messages, isLoading, config, chatContext, saveCurrentSession])

  // 清除历史
  const clearHistory = useCallback(() => {
    setMessages([])
    setCurrentSession(null)
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }, [])

// 更新配置
  const updateConfig = useCallback(async (updates: Partial<AIConfig>) => {
    const newConfig = config ? { ...config, ...updates } : { ...updates } as AIConfig

    // 深度合并 models
    if (updates.models && config?.models) {
      newConfig.models = {
        ...config.models,
        ...updates.models,
      }
    }

    await saveAIConfig(newConfig)
    setConfig(newConfig)

    const configured = await isAIConfigured()
    setIsConfigured(configured)
  }, [config])

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // 切换 Provider
  const switchProvider = useCallback(async (provider: AIConfig['provider']) => {
    await updateConfig({ provider })
  }, [updateConfig])

  const value: AIContextValue = {
    config,
    isConfigured,
    isLoading,
    error,
    currentSession,
    messages,
    selectedText,
    setSelectedText,
    isDialogOpen,
    openDialog,
    closeDialog,
    isSettingsOpen,
    openSettings,
    closeSettings,
    sendMessage,
    regenerateLast,
    clearHistory,
    updateConfig,
    switchProvider,
    stopGeneration,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

/**
 * 使用AI Context的Hook
 */
export function useAI(): AIContextValue {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}
