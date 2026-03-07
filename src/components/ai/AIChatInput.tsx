/**
 * AI聊天输入组件
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AIChatInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function AIChatInput({
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  placeholder = '输入消息...',
}: AIChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [input])

  // 发送消息
  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || disabled) return

    onSend(trimmed)
    setInput('')

    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-background">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-lg border bg-background px-4 py-2.5',
            'text-sm placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[40px] max-h-[150px]'
          )}
          style={{
            height: '40px',
          }}
        />
      </div>

      {/* 发送/停止按钮 */}
      {isLoading ? (
        <button
          onClick={onStop}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg',
            'flex items-center justify-center',
            'bg-destructive text-destructive-foreground',
            'hover:bg-destructive/90 transition-colors'
          )}
          title="停止生成"
        >
          <Square className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg',
            'flex items-center justify-center',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="发送消息"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
