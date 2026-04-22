import { useCallback, useEffect, useRef } from "react"
import { useLocation, useNavigationType } from "react-router-dom"

export function useScrollPosition() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const scrollPositionsRef = useRef<Map<string, number>>(new Map())
  const isRestoringRef = useRef(false)
  const restoredPathsRef = useRef<Set<string>>(new Set())

  // 获取当前页面的滚动位置（从存储中）
  const getSavedScrollPosition = useCallback((key: string): number | undefined => {
    // 先从 ref 中查找
    let scrollY = scrollPositionsRef.current.get(key)
    
    // 如果 ref 中没有，从 sessionStorage 中查找
    if (scrollY === undefined) {
      try {
        const stored = sessionStorage.getItem("scroll-positions")
        if (stored) {
          const positions = JSON.parse(stored)
          scrollY = positions[key]
          // 同步到 ref
          if (scrollY !== undefined) {
            scrollPositionsRef.current.set(key, scrollY)
          }
        }
      } catch {
        // ignore
      }
    }
    
    return scrollY
  }, [])

  // 保存当前页面的滚动位置
  const saveScrollPosition = useCallback(() => {
    // 如果正在恢复滚动位置，不保存
    if (isRestoringRef.current) return
    
    const scrollY = window.scrollY
    const key = location.pathname + location.search
    
    scrollPositionsRef.current.set(key, scrollY)
    restoredPathsRef.current.add(key) // 标记该页面已被访问过
    sessionStorage.setItem("scroll-positions", JSON.stringify(Object.fromEntries(scrollPositionsRef.current)))
  }, [location.pathname, location.search])

  // 恢复页面的滚动位置
  const restoreScrollPosition = useCallback(() => {
    const key = location.pathname + location.search
    const shouldRestore = navigationType === "POP"
    
    // 检查该页面是否有保存的滚动位置
    const savedPosition = getSavedScrollPosition(key)
    
    // 只有浏览器后退/前进时才恢复，普通链接跳转始终回到顶部
    if (shouldRestore && savedPosition !== undefined && savedPosition > 0) {
      isRestoringRef.current = true
      
      // 使用 requestAnimationFrame 确保在合适的时机恢复
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition)
        
        // 延迟重置标志，避免滚动事件被忽略
        setTimeout(() => {
          isRestoringRef.current = false
        }, 200)
      })
    } else {
      // 普通链接跳转或没有保存位置时，确保滚动到顶部
      requestAnimationFrame(() => {
        if (window.scrollY > 0) {
          window.scrollTo(0, 0)
        }
      })
    }
  }, [getSavedScrollPosition, location.pathname, location.search, navigationType])

  useEffect(() => {
    // 初始化时加载 sessionStorage 中的数据
    try {
      const stored = sessionStorage.getItem("scroll-positions")
      if (stored) {
        const positions = JSON.parse(stored)
        scrollPositionsRef.current = new Map(Object.entries(positions))
      }
    } catch {
      // ignore
    }

    // 监听滚动事件
    const handleScroll = () => {
      saveScrollPosition()
    }

    // 使用节流，避免频繁保存
    let timeoutId: NodeJS.Timeout | null = null
    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 100)
    }

    window.addEventListener("scroll", throttledScroll, { passive: true })

    // 延迟执行恢复，确保页面已经渲染
    const restoreTimer = setTimeout(() => {
      restoreScrollPosition()
    }, 50)

    // 组件卸载时保存当前滚动位置
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      clearTimeout(restoreTimer)
      window.removeEventListener("scroll", throttledScroll)
      saveScrollPosition()
    }
  }, [location.pathname, location.search, restoreScrollPosition, saveScrollPosition])

  // 清除指定路径的滚动位置
  const clearScrollPosition = useCallback((pathname: string) => {
    const key = pathname + window.location.search
    scrollPositionsRef.current.delete(key)
    restoredPathsRef.current.delete(key)
    
    // 更新 sessionStorage
    try {
      const positions = Object.fromEntries(scrollPositionsRef.current)
      sessionStorage.setItem("scroll-positions", JSON.stringify(positions))
    } catch {
      // ignore
    }
  }, [])

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  }
}
