/**
 * 选中文本触发器组件
 * 监听文本选择，显示AI询问按钮
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAI } from './AIProvider'
import { Bot } from 'lucide-react'

interface SelectionPosition {
  top: number
  left: number
}

export function AISelectionTrigger() {
  const { openDialog, isConfigured, isDialogOpen, openSettings } = useAI()

  const [selectedText, setSelectedText] = useState('')
  const [showButton, setShowButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState<SelectionPosition>({ top: 0, left: 0 })

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 处理文本选择
  const handleSelectionChange = useCallback(() => {
    // 如果对话框已打开，不处理
    if (isDialogOpen) {
      setShowButton(false)
      return
    }

    const selection = window.getSelection()
    const text = selection?.toString().trim() || ''

    // 文本太短（< 5字符），隐藏按钮
    if (text.length < 5) {
      setSelectedText('')
      setShowButton(false)
      return
    }

    setSelectedText(text)

    // 获取选区位置
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // 计算按钮位置（选区右下角）
      const top = rect.bottom + window.scrollY + 8
      const left = rect.right + window.scrollX - 40 // 按钮宽度约40px

      setButtonPosition({ top, left })
      setShowButton(true)
    }
  }, [isDialogOpen])

  // 监听选择变化
  useEffect(() => {
    let isMouseDown = false

    const handleMouseDown = () => {
      isMouseDown = true
      // 清除之前的隐藏定时器
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }

    const handleMouseUp = () => {
      isMouseDown = false
      // 延迟处理，等待选择完成
      setTimeout(() => {
        handleSelectionChange()
      }, 10)
    }

    const handleSelectionChangeEvent = () => {
      // 选择变化时，如果鼠标已经释放，更新按钮位置
      if (!isMouseDown) {
        handleSelectionChange()
      }
    }

    // 点击其他地方时隐藏
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        // 延迟隐藏，给用户点击按钮的时间
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
  }, [handleSelectionChange])

  // 点击AI询问按钮
  const handleAskAI = useCallback(() => {
    if (!selectedText) {
      return
    }

    if (!isConfigured) {
      // 未配置时打开设置面板
      openSettings()
      return
    }

    openDialog({
      selectedText,
      pageTitle: document.title,
      pageUrl: window.location.href,
    })

    // 清除选择
    window.getSelection()?.removeAllRanges()
    setShowButton(false)
    setSelectedText('')
  }, [selectedText, isConfigured, openDialog, openSettings])

  // 不显示按钮的情况
  if (!showButton || isDialogOpen) {
    return null
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleAskAI}
      className="fixed z-50 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110"
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