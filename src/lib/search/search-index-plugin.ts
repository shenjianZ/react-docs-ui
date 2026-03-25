import type { Plugin, ResolvedConfig } from 'vite'
import path from 'node:path'
import {
  generateSearchIndex,
  generateAllSearchIndices,
  writeSearchIndex,
} from './build/index-generator'

export interface SearchIndexPluginOptions {
  publicDir?: string
  enabled?: boolean
  langs?: string[]
}

export function searchIndexPlugin(options: SearchIndexPluginOptions = {}): Plugin {
  const {
    publicDir = 'public',
    enabled = true,
    langs,
  } = options

  let isGenerating = false
  let config: ResolvedConfig | null = null

  const resolvePublicDir = (root: string) => {
    return path.isAbsolute(publicDir) ? publicDir : path.join(root, publicDir)
  }

  const generateIndices = async (root: string) => {
    if (!enabled || isGenerating) return
    
    isGenerating = true
    const publicDirPath = resolvePublicDir(root)
    
    try {
      if (langs && langs.length > 0) {
        for (const lang of langs) {
          const index = await generateSearchIndex(publicDirPath, lang)
          writeSearchIndex(publicDirPath, lang, index)
        }
      } else {
        const indices = await generateAllSearchIndices(publicDirPath)
        for (const [lang, index] of indices) {
          writeSearchIndex(publicDirPath, lang, index)
        }
      }
    } catch (error) {
      console.error('[search-index-plugin] Failed to generate search index:', error)
    } finally {
      isGenerating = false
    }
  }

  return {
    name: 'vite-plugin-search-index',
    enforce: 'post',

    configureServer(devServer) {
      config = devServer.config
      const root = devServer.config.root
      
      generateIndices(root)

      const docsDir = path.join(resolvePublicDir(root), 'docs')
      devServer.watcher.add(docsDir)

      const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
        let timer: ReturnType<typeof setTimeout> | null = null
        return (...args: Parameters<T>) => {
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => fn(...args), delay)
        }
      }

      const debouncedGenerate = debounce(async () => {
        await generateIndices(root)
        
        const indexFiles = langs || ['zh-cn', 'en']
        
        for (const lang of indexFiles) {
          devServer.ws.send({
            type: 'custom',
            event: 'search-index-updated',
            data: { lang },
          })
        }
      }, 500)

      const isDocFile = (file: string) => {
        return file.includes(path.sep + 'docs' + path.sep) && 
               (file.endsWith('.md') || file.endsWith('.mdx'))
      }

      devServer.watcher.on('change', (file) => {
        if (isDocFile(file)) {
          debouncedGenerate()
        }
      })

      devServer.watcher.on('add', (file) => {
        if (isDocFile(file)) {
          debouncedGenerate()
        }
      })

      devServer.watcher.on('unlink', (file) => {
        if (isDocFile(file)) {
          debouncedGenerate()
        }
      })
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async buildStart() {
      if (config?.build?.watch) return
      
      const root = config?.root || process.cwd()
      await generateIndices(root)
    },
  }
}

export { generateSearchIndex, generateAllSearchIndices, writeSearchIndex }
