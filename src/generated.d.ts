import * as React from 'react'

declare module '/src/generated/mdx-components.ts' {
  export interface ComponentRegistry {
    [componentName: string]: React.ComponentType<any>
  }

  export const MDX_COMPONENTS: ComponentRegistry
}