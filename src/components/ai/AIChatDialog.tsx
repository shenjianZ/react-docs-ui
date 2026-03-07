/**
 * AI聊天对话框组件
 * 从底部弹出的对话框，支持拖拽、快捷键
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAI } from './AIProvider'
import { AIChatMessage } from './AIChatMessage'
import { AIChatInput } from './AIChatInput'
import { cn } from '../../lib/utils'
import { X, Settings, Trash2, Bot, AlertTriangle, GripVertical } from 'lucide-react'

const MIN_HEIGHT = 300
const MAX_HEIGHT = 700
const DEFAULT_HEIGHT = 500

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
    editMessage,
    deleteMessage,
  } = useAI()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)
  
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 })

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }, [])

  const handleScroll = useCallback(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return
    
    const { scrollTop, scrollHeight, clientHeight } = scrollArea
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    isNearBottomRef.current = isNearBottom
  }, [])

  useEffect(() => {
    if (isNearBottomRef.current && messagesEndRef.current) {
      const lastMessage = messages[messages.length - 1]
      const isStreaming = lastMessage?.isStreaming
      scrollToBottom(isStreaming ? 'auto' : 'smooth')
    }
  }, [messages, scrollToBottom])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDialogOpen) {
        closeDialog()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDialogOpen, closeDialog])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startY = e.clientY
    const startHeight = height

    const handleMouseMove = (e: MouseEvent) => {
      const diff = startY - e.clientY
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + diff))
      setHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [height])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    }

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [position])

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

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
    <div 
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div
        ref={dialogRef}
        className={cn(
          'bg-background border rounded-xl shadow-2xl overflow-hidden',
          'animate-in slide-in-from-bottom-4 duration-300',
          'flex flex-col',
          isDragging && 'cursor-grabbing',
          isResizing && 'cursor-ns-resize'
        )}
        style={{ height: `${height}px`, maxHeight: '70vh' }}
      >
        <div 
          className="flex items-center justify-between p-4 border-b shrink-0 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <Bot className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI 助手</h3>
          </div>

          <div className="flex items-center gap-1">
            {position.x !== 0 || position.y !== 0 ? (
              <button
                onClick={resetPosition}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="重置位置"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}

            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="清除对话"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={openSettings}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={closeDialog}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedText && (
          <div className="px-4 py-2 bg-muted/50 border-b shrink-0">
            <div className="text-xs text-muted-foreground mb-1">选中的内容：</div>
            <div className="text-sm line-clamp-2">{selectedText}</div>
          </div>
        )}

        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
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
                  onEdit={
                    message.role === 'user'
                      ? (newContent) => editMessage(message.id, newContent)
                      : undefined
                  }
                  onDelete={
                    !isLoading
                      ? () => deleteMessage(message.id)
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t">
            {error}
          </div>
        )}

        <AIChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
          placeholder={selectedText ? '询问关于选中内容的问题...' : '输入消息...'}
        />

        <div
          ref={resizeRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-2 cursor-ns-resize flex items-center justify-center"
          onMouseDown={handleResizeStart}
        >
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  )
}
