import * as React from 'react'
import { useState } from 'react'

interface CodeBlockProps {
  language?: string
  filename?: string
  children: React.ReactNode
  showLineNumbers?: boolean
  highlightLines?: number[]
  showCopy?: boolean
  collapse?: boolean
  maxHeight?: string
  title?: string
}

export function CodeBlock({ 
  language = 'typescript', 
  filename,
  title,
  children,
  showLineNumbers = true,
  highlightLines = [],
  showCopy = true,
  collapse = false,
  maxHeight
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const code = typeof children === 'string' ? children : String(children)
  const lines = code.split('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const languageColors: Record<string, string> = {
    typescript: '#3178c6',
    javascript: '#f7df1e',
    python: '#3776ab',
    java: '#007396',
    go: '#00add8',
    rust: '#dea584',
    css: '#1572b6',
    html: '#e34c26',
    json: '#f7df1e',
    bash: '#4eaa25',
    sh: '#4eaa25',
    sql: '#336791',
    yaml: '#cb171e',
    yml: '#cb171e',
    xml: '#0060ac',
    c: '#555555',
    'c++': '#f34b7d',
    cpp: '#f34b7d',
    csharp: '#239120',
    php: '#777bb4',
    ruby: '#cc342d',
    swift: '#f05138',
    kotlin: '#a97bff',
    dart: '#0175c2',
    scala: '#dc322f',
    r: '#198ce7',
    matlab: '#e6e6e6',
    default: '#6c757d'
  }

  const languageNames: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    java: 'Java',
    go: 'Go',
    rs: 'Rust',
    css: 'CSS',
    html: 'HTML',
    json: 'JSON',
    bash: 'Bash',
    sh: 'Shell',
    sql: 'SQL',
    yaml: 'YAML',
    yml: 'YAML',
    xml: 'XML',
    c: 'C',
    cpp: 'C++',
    'c++': 'C++',
    cs: 'C#',
    csharp: 'C#',
    php: 'PHP',
    rb: 'Ruby',
    swift: 'Swift',
    kt: 'Kotlin',
    dart: 'Dart',
    scala: 'Scala',
    r: 'R',
    m: 'MATLAB'
  }

  const languageKey = language.toLowerCase()
  const languageColor = languageColors[languageKey] || languageColors.default
  const displayName = languageNames[languageKey] || language

  const displayTitle = title || filename

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900/50 dark:shadow-gray-900/20">
      <div className="flex items-center justify-between border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 dark:border-gray-700/50 dark:from-gray-800/80 dark:to-gray-800">
        <div className="flex items-center gap-3">
          {displayTitle && (
            <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">{displayTitle}</span>
          )}
          <span 
            className="rounded-md px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: languageColor }}
          >
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lines.length} {lines.length === 1 ? '行' : '行'}
          </span>
          {collapse && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-gray-200/80 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-700/80"
              title={isCollapsed ? '展开代码' : '折叠代码'}
            >
              {isCollapsed ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  展开
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  折叠
                </>
              )}
            </button>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-gray-200/80 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-700/80"
              title={copied ? '已复制!' : '复制代码'}
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600 dark:text-green-400">已复制</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div 
        className={`overflow-x-auto ${maxHeight ? 'overflow-y-auto' : ''} custom-scrollbar`}
        style={isCollapsed ? { maxHeight: '0', overflow: 'hidden' } : { maxHeight: maxHeight || 'auto' }}
      >
        <pre className="flex bg-white dark:bg-[#141414]">
          {showLineNumbers && (
            <div className="flex select-none flex-col border-r border-gray-200/50 bg-gradient-to-b from-gray-50/50 to-gray-100/50 pr-4 text-right text-sm font-medium leading-6 text-gray-400 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50 dark:text-gray-500">
              {lines.map((_, index) => (
                <span 
                  key={index} 
                  className={`px-2 ${highlightLines.includes(index + 1) ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : ''}`}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          )}
          <code className="flex-1 p-4 font-mono text-sm leading-6 text-gray-800 dark:text-gray-200">
            {lines.map((line, index) => (
              <div
                key={index}
                className={`relative -mx-4 px-4 transition-colors duration-150 ${
                  highlightLines.includes(index + 1) 
                    ? 'bg-gradient-to-r from-yellow-100/80 via-yellow-50/50 to-transparent dark:from-yellow-900/40 dark:via-yellow-900/20 dark:to-transparent before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-yellow-500 before:content-[""]' 
                    : ''
                }`}
              >
                {line || ' '}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}