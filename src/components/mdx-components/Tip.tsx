import * as React from 'react'

interface TipProps {
  title?: string
  children: React.ReactNode
}

export function Tip({ title, children }: TipProps) {
  return (
    <div className="my-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
      {title && <div className="mb-2 font-semibold text-blue-900 dark:text-blue-100">{title}</div>}
      <div className="text-blue-800 dark:text-blue-200">{children}</div>
    </div>
  )
}