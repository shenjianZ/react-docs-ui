import * as React from 'react'

interface WarningProps {
  title?: string
  children: React.ReactNode
}

export function Warning({ title, children }: WarningProps) {
  return (
    <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
      {title && <div className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">{title}</div>}
      <div className="text-yellow-800 dark:text-yellow-200">{children}</div>
    </div>
  )
}