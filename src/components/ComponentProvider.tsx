import { createContext, useContext, type ReactNode } from 'react'
import type { ComponentRegistry } from '../lib/component-scanner'

interface ComponentContextValue {
  components: ComponentRegistry
}

const ComponentContext = createContext<ComponentContextValue | undefined>(undefined)

interface ComponentProviderProps {
  components: ComponentRegistry
  children: ReactNode
}

export function ComponentProvider({ components, children }: ComponentProviderProps) {
  return (
    <ComponentContext.Provider value={{ components }}>
      {children}
    </ComponentContext.Provider>
  )
}

export function useComponents(): ComponentRegistry {
  const context = useContext(ComponentContext)
  if (!context) {
    console.warn('useComponents must be used within ComponentProvider')
    return {}
  }
  return context.components
}