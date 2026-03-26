import React from 'react'
import { Tip, Warning, Card } from '../components/mdx-components'

/**
 * 组件注册表类型
 */
export interface ComponentRegistry {
  [componentName: string]: React.ComponentType<any>
}

/**
 * 组件配置类型
 */
export interface ComponentConfig {
  name: string
  path: string
}

/**
 * 内置的 MDX 组件注册表
 * 这些组件可以直接在 MDX 文档中使用
 */
const BUILTIN_MDX_COMPONENTS: ComponentRegistry = {
  Tip,
  Warning,
  Card
}

let generatedComponentsPromise: Promise<ComponentRegistry | null> | null = null
const importGeneratedComponents = new Function(
  'componentPath',
  'return import(componentPath)'
) as (componentPath: string) => Promise<{ MDX_COMPONENTS?: ComponentRegistry }>

function getGeneratedComponentsPromise(): Promise<ComponentRegistry | null> {
  if (!generatedComponentsPromise) {
    const componentPath = ['src', 'generated', 'mdx-components.ts'].join('/')
    generatedComponentsPromise = importGeneratedComponents(`/${componentPath}`)
      .then(module => {
        if (module && module.MDX_COMPONENTS) {
          return module.MDX_COMPONENTS as ComponentRegistry
        }
        return null
      })
      .catch(() => null)
  }

  return generatedComponentsPromise
}

/**
 * 尝试从 template 生成的组件索引文件加载组件
 */
async function loadFromGeneratedIndex(): Promise<ComponentRegistry | null> {
  try {
    return await getGeneratedComponentsPromise()
  } catch (_error) {
    // 索引文件不存在或加载失败，返回 null
    return null
  }
}

export function prefetchGeneratedComponents(): void {
  void getGeneratedComponentsPromise()
}

/**
 * 扫描 src/components 目录并返回组件列表
 * 注意：这个函数在库中被禁用，只在 template 运行时可能通过 Vite 插件工作
 * 
 * @param componentsPath 组件目录路径（相对于项目根目录）
 * @returns 组件配置列表
 */
export async function scanComponents(_componentsPath: string = '/src/components'): Promise<ComponentConfig[]> {
  // 不扫描用户组件，避免 404 错误
  // 使用生成的索引文件或配置文件
  return []
}

/**
 * 从配置创建组件列表
 * @param componentsConfig 配置中的组件映射
 * @returns 组件配置列表
 */
export function createComponentsFromConfig(componentsConfig?: Record<string, string>): ComponentConfig[] {
  if (!componentsConfig) {
    return []
  }
  
  return Object.entries(componentsConfig).map(([name, path]) => ({
    name,
    path
  }))
}

/**
 * 动态导入组件
 * @param componentPath 组件文件路径
 * @returns 组件模块
 */
export async function importComponent(componentPath: string): Promise<React.ComponentType<any> | null> {
  try {
    const module = await import(/* @vite-ignore */ componentPath)
    
    // 查找默认导出或命名导出
    const component = module.default || Object.values(module).find(
      (exp: any) => typeof exp === 'function' && exp.name
    )
    
    return component || null
  } catch (error) {
    console.warn(`[MDX] 无法导入组件 ${componentPath}:`, error)
    return null
  }
}

/**
 * 批量加载组件并创建注册表
 * @param components 组件配置列表
 * @param componentsConfig 配置中的组件映射（可选）
 * @returns 组件注册表
 */
export async function loadComponents(
  _components: ComponentConfig[],
  componentsConfig?: Record<string, string>
): Promise<ComponentRegistry> {
  const registry: ComponentRegistry = {}
  
  // 首先添加内置的 MDX 组件
  Object.assign(registry, BUILTIN_MDX_COMPONENTS)
  
  // 尝试从生成的索引文件加载用户组件
  const userComponents = await loadFromGeneratedIndex()
  if (userComponents && Object.keys(userComponents).length > 0) {
    Object.assign(registry, userComponents)
  }
  
  // 处理配置中的组件（如果没有从索引文件加载到）
  if (componentsConfig && Object.keys(componentsConfig).length > 0 && !userComponents) {
    for (const [name, path] of Object.entries(componentsConfig)) {
      try {
        const Component = await importComponent(path)
        if (Component) {
          registry[name] = Component
        }
      } catch (error) {
        console.warn(`[MDX] 加载组件 ${name} 失败:`, error)
      }
    }
  }
  
  return registry
}

/**
 * 获取内置组件
 * @returns 内置组件注册表
 */
export function getBuiltinComponents(): ComponentRegistry {
  return { ...BUILTIN_MDX_COMPONENTS }
}

/**
 * 合并默认组件和自定义组件
 * @param customComponents 自定义组件注册表
 * @returns 合并后的组件注册表
 */
export function mergeComponents(
  customComponents: ComponentRegistry = {}
): Record<string, React.ComponentType<any>> {
  return {
    ...BUILTIN_MDX_COMPONENTS,
    ...customComponents
  }
}
