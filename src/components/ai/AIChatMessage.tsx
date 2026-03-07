/**
 * AI聊天消息组件
 */

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'
import type { ChatMessage as ChatMessageType } from '../../lib/ai/types'
import { Bot, User, Loader2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react'

interface AIChatMessageProps {
  message: ChatMessageType
  onRegenerate?: () => void
}

export function AIChatMessage({ message, onRegenerate }: AIChatMessageProps) {
  const [copied, setCopied] = React.useState(false)

  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming
  const hasError = !!message.error

  // 复制消息
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 忽略错误
    }
  }

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* 消息内容 */}
      <div
        className={cn(
          'flex-1 min-w-0',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block max-w-full rounded-lg px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground',
            hasError && 'border border-destructive'
          )}
        >
          {message.content ? (
            <div
              className={cn(
                'prose prose-sm dark:prose-invert max-w-none',
                isUser && 'prose-invert'
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : isStreaming ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>正在思考...</span>
            </div>
          ) : null}

          {/* 错误状态 */}
          {hasError && (
            <div className="flex items-center gap-2 text-destructive mt-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{message.error}</span>
            </div>
          )}
        </div>

        {/* 操作按钮（仅助手消息显示） */}
        {!isUser && message.content && !isStreaming && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="复制"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="重新生成"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
