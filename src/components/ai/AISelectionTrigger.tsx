/**
 * 选中文本触发器组件
 * 监听文本选择，显示AI询问按钮
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAI } from './AIProvider'
import { Bot } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SelectionPosition {
  top: number
  left: number
}

function useDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay]) as T
}

export function AISelectionTrigger() {
  const { openDialog, isConfigured, isDialogOpen, openSettings } = useAI()

  const [selectedText, setSelectedText] = useState('')
  const [showButton, setShowButton] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [buttonPosition, setButtonPosition] = useState<SelectionPosition>({ top: 0, left: 0 })

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleSelectionChange = useCallback(() => {
    if (isDialogOpen) {
      setShowButton(false)
      return
    }

    const selection = window.getSelection()
    const text = selection?.toString().trim() || ''

    if (text.length < 5) {
      setSelectedText('')
      setShowButton(false)
      return
    }

    setSelectedText(text)

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      const top = rect.bottom + window.scrollY + 8
      const left = rect.right + window.scrollX - 40

      setButtonPosition({ top, left })
      setIsAnimating(true)
      setShowButton(true)
    }
  }, [isDialogOpen])

  const debouncedSelectionChange = useDebounce(handleSelectionChange, 150)

  useEffect(() => {
    let isMouseDown = false

    const handleMouseDown = () => {
      isMouseDown = true
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }

    const handleMouseUp = () => {
      isMouseDown = false
      setTimeout(() => {
        handleSelectionChange()
      }, 10)
    }

    const handleSelectionChangeEvent = () => {
      if (!isMouseDown) {
        debouncedSelectionChange()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        hideTimeoutRef.current = setTimeout(() => {
          setShowButton(false)
        }, 200)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('selectionchange', handleSelectionChangeEvent)
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('selectionchange', handleSelectionChangeEvent)
      document.removeEventListener('click', handleClickOutside)

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [handleSelectionChange, debouncedSelectionChange])

  const handleAskAI = useCallback(() => {
    if (!selectedText) {
      return
    }

    if (!isConfigured) {
      openSettings()
      return
    }

    openDialog({
      selectedText,
      pageTitle: document.title,
      pageUrl: window.location.href,
    })

    window.getSelection()?.removeAllRanges()
    setShowButton(false)
    setSelectedText('')
  }, [selectedText, isConfigured, openDialog, openSettings])

  if (!showButton || isDialogOpen) {
    return null
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleAskAI}
      className={cn(
        'fixed z-50 flex items-center justify-center w-10 h-10 rounded-full',
        'bg-primary text-primary-foreground shadow-lg',
        'hover:bg-primary/90 transition-all duration-200 hover:scale-110',
        isAnimating && 'animate-in zoom-in-50 duration-200'
      )}
      style={{
        top: buttonPosition.top,
        left: buttonPosition.left,
      }}
      title="向AI询问选中内容"
    >
      <Bot className="w-5 h-5" />
    </button>
  )
}
