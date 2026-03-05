import * as React from 'react'

interface CardProps {
  title?: string
  children: React.ReactNode
}

export const Card = React.memo(({ title, children }: CardProps) => {
  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {title && <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{title}</div>}
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )
})