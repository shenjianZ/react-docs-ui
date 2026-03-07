/**
 * AI聊天对话框组件
 * 从底部弹出的对话框
 */

import { useEffect, useRef } from 'react'
import { useAI } from './AIProvider'
import { AIChatMessage } from './AIChatMessage'
import { AIChatInput } from './AIChatInput'
import { cn } from '../../lib/utils'
import { X, Settings, Trash2, Bot, AlertTriangle } from 'lucide-react'

export function AIChatDialog() {
  const {
    isDialogOpen,
    closeDialog,
    openSettings,
    messages,
    isLoading,
    error,
    isConfigured,
    selectedText,
    sendMessage,
    regenerateLast,
    clearHistory,
    stopGeneration,
  } = useAI()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 未配置时显示引导
  if (!isConfigured && isDialogOpen) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl">
        <div
          className={cn(
            'bg-background border rounded-xl shadow-2xl',
            'animate-in slide-in-from-bottom-4 duration-300'
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI 助手</h3>
            </div>
            <button
              onClick={closeDialog}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">需要配置 AI</h4>
            <p className="text-muted-foreground mb-4">
              请先配置 AI 提供商和 API 密钥才能使用此功能
            </p>
            <button
              onClick={() => {
                closeDialog()
                openSettings()
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              前往设置
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isDialogOpen) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl">
      <div
        className={cn(
          'bg-background border rounded-xl shadow-2xl overflow-hidden',
          'animate-in slide-in-from-bottom-4 duration-300',
          'flex flex-col',
          'h-[500px] max-h-[70vh]'
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI 助手</h3>
          </div>

          <div className="flex items-center gap-1">
            {/* 清除历史 */}
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="清除对话"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* 设置 */}
            <button
              onClick={openSettings}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* 关闭 */}
            <button
              onClick={closeDialog}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 选中文本预览 */}
        {selectedText && (
          <div className="px-4 py-2 bg-muted/50 border-b shrink-0">
            <div className="text-xs text-muted-foreground mb-1">选中的内容：</div>
            <div className="text-sm line-clamp-2">{selectedText}</div>
          </div>
        )}

        {/* 消息区域 */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <Bot className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-center">
                你好！我是 AI 助手。
                <br />
                有什么我可以帮助你的吗？
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((message, index) => (
                <AIChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={
                    message.role === 'assistant' &&
                    index === messages.length - 1 &&
                    !isLoading
                      ? regenerateLast
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t">
            {error}
          </div>
        )}

        {/* 输入区域 */}
        <AIChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
          placeholder={selectedText ? '询问关于选中内容的问题...' : '输入消息...'}
        />
      </div>
    </div>
  )
}
