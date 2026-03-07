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

const CURRENT_SESSION_KEY = 'ai-current-session'
const CONFIG_CACHE_TTL = 60000

interface AIContextValue {
  config: AIConfig | null
  isConfigured: boolean
  isLoading: boolean
  error: string | null
  currentSession: ChatSession | null
  messages: ChatMessage[]
  selectedText: string
  setSelectedText: (text: string) => void
  isDialogOpen: boolean
  openDialog: (context?: ChatContext) => void
  closeDialog: () => void
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  sendMessage: (content: string) => Promise<void>
  regenerateLast: () => Promise<void>
  clearHistory: () => void
  updateConfig: (config: Partial<AIConfig>) => Promise<void>
  switchProvider: (provider: AIConfig['provider']) => Promise<void>
  stopGeneration: () => void
  editMessage: (messageId: string, newContent: string) => void
  deleteMessage: (messageId: string) => void
}

const AIContext = createContext<AIContextValue | null>(null)

interface AIProviderProps {
  children: React.ReactNode
}

let configCache: { config: AIConfig | null; timestamp: number } | null = null

async function getAIConfigWithCache(): Promise<AIConfig | null> {
  const now = Date.now()
  
  if (configCache && (now - configCache.timestamp) < CONFIG_CACHE_TTL) {
    return configCache.config
  }
  
  const config = await getAIConfig()
  configCache = { config, timestamp: now }
  return config
}

function invalidateConfigCache() {
  configCache = null
}

export function AIProvider({ children }: AIProviderProps) {
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [chatContext, setChatContext] = useState<ChatContext | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadConfig = async () => {
      try {
        const savedConfig = await getAIConfigWithCache()
        if (cancelled) return
        
        setConfig(savedConfig)

        const configured = await isAIConfigured()
        if (cancelled) return
        
        setIsConfigured(configured)

        const saved = localStorage.getItem(CURRENT_SESSION_KEY)
        if (saved && !cancelled) {
          try {
            const session: ChatSession = JSON.parse(saved)
            setCurrentSession(session)
            setMessages(session.messages)
          } catch {
            console.error('[AI] Failed to load session')
          }
        }
      } catch (err) {
        console.error('[AI] 加载 AI 配置失败:', err)
      }
    }

    loadConfig()

    return () => {
      cancelled = true
    }
  }, [])

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
      console.error('[AI] Failed to save session')
    }
  }, [currentSession])

  const openDialog = useCallback((context?: ChatContext) => {
    if (context) {
      setChatContext(context)
      setSelectedText(context.selectedText || '')
    }
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  const executeChat = useCallback(async (
    messagesToSend: ChatMessage[],
    onComplete?: () => void
  ) => {
    if (!config || isLoading) return

    const assistantMessage = createAssistantMessage()
    const newMessages = [...messagesToSend, assistantMessage]
    setMessages(newMessages)
    setIsLoading(true)
    setError(null)

    abortControllerRef.current = new AbortController()
    let currentContent = ''

    try {
      await sendChatMessage(
        messagesToSend,
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
              onComplete?.()
              break

            case 'error':
              if (event.error === '请求已取消') {
                setMessages(prev => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                    let content = updated[lastIndex].content
                    
                    const codeBlockMatches = content.match(/```/g)
                    if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
                      content += '\n```'
                    }
                    
                    updated[lastIndex] = updateAssistantMessage(
                      updated[lastIndex],
                      content,
                      false
                    )
                  }
                  saveCurrentSession(updated)
                  return updated
                })
              } else {
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
              }
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
  }, [config, isLoading, chatContext, saveCurrentSession])

  const sendMessage = useCallback(async (content: string) => {
    if (!config || isLoading) return

    const fullContent = buildContextMessage(content, chatContext)
    const userMessage = createUserMessage(fullContent)
    const messagesToSend = messages.concat(userMessage)

    await executeChat(messagesToSend)
  }, [config, messages, isLoading, chatContext, executeChat])

  const regenerateLast = useCallback(async () => {
    if (messages.length < 2 || isLoading) return

    const messagesWithoutLast = messages.slice(0, -1)
    setMessages(messagesWithoutLast)

    const lastUserMessage = messagesWithoutLast.filter(m => m.role === 'user').pop()
    if (lastUserMessage) {
      await executeChat(messagesWithoutLast)
    }
  }, [messages, isLoading, executeChat])

  const clearHistory = useCallback(() => {
    setMessages([])
    setCurrentSession(null)
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }, [])

  const updateConfig = useCallback(async (updates: Partial<AIConfig>) => {
    const newConfig = config ? { ...config, ...updates } : { ...updates } as AIConfig

    if (updates.models && config?.models) {
      newConfig.models = {
        ...config.models,
        ...updates.models,
      }
    }

    await saveAIConfig(newConfig)
    invalidateConfigCache()
    setConfig(newConfig)

    const configured = await isAIConfigured()
    setIsConfigured(configured)
  }, [config])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const switchProvider = useCallback(async (provider: AIConfig['provider']) => {
    await updateConfig({ provider })
  }, [updateConfig])

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(m => m.id === messageId)
      if (messageIndex === -1) return prev

      const updated = [...prev]
      updated[messageIndex] = {
        ...updated[messageIndex],
        content: newContent,
        timestamp: Date.now(),
      }

      if (updated[messageIndex].role === 'user') {
        const messagesAfterEdit = updated.slice(0, messageIndex + 1)
        saveCurrentSession(messagesAfterEdit)
        return messagesAfterEdit
      }

      saveCurrentSession(updated)
      return updated
    })
  }, [saveCurrentSession])

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(m => m.id === messageId)
      if (messageIndex === -1) return prev

      const updated = prev.slice(0, messageIndex)
      saveCurrentSession(updated)
      return updated
    })
  }, [saveCurrentSession])

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
    editMessage,
    deleteMessage,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI(): AIContextValue {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}
