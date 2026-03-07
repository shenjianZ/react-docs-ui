/**
 * AI聊天消息组件
 * 支持Markdown渲染、代码高亮、复制、编辑、删除功能
 */

import React, { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'
import type { ChatMessage as ChatMessageType } from '../../lib/ai/types'
import { Bot, User, Loader2, AlertCircle, RefreshCw, Copy, Check, CheckCircle, Pencil, Trash2, X, CheckCheck } from 'lucide-react'
import './AIChatMessage.css'

interface AIChatMessageProps {
  message: ChatMessageType
  onRegenerate?: () => void
  onEdit?: (newContent: string) => void
  onDelete?: () => void
}

export function AIChatMessage({ message, onRegenerate, onEdit, onDelete }: AIChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming
  const hasError = !!message.error

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy message')
    }
  }, [message.content])

  const handleCopyCode = useCallback(async (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      console.error('Failed to copy code')
    }
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(editContent.trim())
    }
    setIsEditing(false)
  }, [editContent, message.content, onEdit])

  const handleCancelEdit = useCallback(() => {
    setEditContent(message.content)
    setIsEditing(false)
  }, [message.content])

  return (
    <div
      className={cn(
        'flex gap-3 p-4 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
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

      <div
        className={cn(
          'flex-1 min-w-0',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        {isEditing ? (
          <div className="inline-block max-w-full">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={cn(
                'w-full min-w-[200px] max-w-[400px] p-3 rounded-lg border',
                'bg-background text-sm resize-none',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              rows={Math.min(10, editContent.split('\n').length + 1)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleCancelEdit}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="取消"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveEdit}
                className="p-1.5 rounded text-primary hover:bg-primary/10 transition-colors"
                title="保存"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ children }) => {
                      const extractCodeString = (node: React.ReactNode): string => {
                        if (typeof node === 'string') return node
                        if (Array.isArray(node)) return node.map(extractCodeString).join('')
                        if (React.isValidElement(node)) {
                          const childProps = node.props as { children?: React.ReactNode }
                          if (childProps.children) {
                            return extractCodeString(childProps.children)
                          }
                        }
                        return ''
                      }
                      
                      const codeElement = React.Children.toArray(children).find(
                        (child) => React.isValidElement(child) && child.type === 'code'
                      )
                      
                      const codeString = codeElement && React.isValidElement(codeElement)
                        ? extractCodeString((codeElement.props as { children?: React.ReactNode }).children).replace(/\n$/, '')
                        : ''
                      
                      return (
                        <div className="relative my-3 rounded-lg overflow-hidden border dark:border-zinc-700 border-zinc-200 dark:bg-[#141414] bg-[#fafafa]">
                          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-zinc-700 border-zinc-200 dark:bg-[#1a1a1a] bg-zinc-100">
                            <span className="text-xs dark:text-zinc-400 text-zinc-500">代码</span>
                            {codeString && (
                              <button
                                type="button"
                                onClick={(e) => handleCopyCode(codeString, e)}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-300 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 transition-colors"
                              >
                                {copiedCode === codeString ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    已复制
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    复制
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <pre className="!m-0 p-4 overflow-x-auto text-sm hljs">
                            {children}
                          </pre>
                        </div>
                      )
                    },
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '')
                      const isCodeBlock = match || className?.includes('hljs')
                      
                      if (isCodeBlock) {
                        return (
                          <code className={cn(className, 'block')} {...props}>
                            {children}
                          </code>
                        )
                      }
                      
                      const isStandaloneBlock = !className && String(children).includes('\n')
                      if (isStandaloneBlock) {
                        return (
                          <code className="block" {...props}>
                            {children}
                          </code>
                        )
                      }
                      
                      return (
                        <code className="px-1.5 py-0.5 rounded dark:bg-zinc-700 bg-zinc-200 text-sm" {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : isStreaming ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在思考...</span>
                </div>
              ) : null}

              {hasError && (
                <div className="flex items-center gap-2 text-destructive mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{message.error}</span>
                </div>
              )}
            </div>

            {!isStreaming && (
              <div className={cn(
                'flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity',
                isUser ? 'justify-end' : 'justify-start'
              )}>
                {!isUser && message.content && (
                  <>
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
                  </>
                )}

                {isUser && onEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="编辑"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
