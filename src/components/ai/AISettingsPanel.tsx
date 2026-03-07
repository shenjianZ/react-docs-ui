/**
 * AI设置面板组件
 */

import { useState, useEffect } from 'react'
import { useAI } from './AIProvider'
import { cn } from '../../lib/utils'
import type { AIModelConfig } from '../../lib/ai/types'
import {
  getDefaultModelConfig,
  getProviderDisplayName,
  getProviderDefaultModels,
  getProviderHelpInfo,
  testAIConnection,
  validateModelConfig,
  deleteProvider,
  getAllProviders,
} from '../../lib/ai'
import {
  X,
  Check,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  Plus,
  Trash2,
  Save,
  Star,
} from 'lucide-react'

type TabType = 'providers' | 'settings'

export function AISettingsPanel() {
  const { isSettingsOpen, closeSettings, config, updateConfig } = useAI()

  // 表单状态
  const [currentProvider, setCurrentProvider] = useState<string>('openai')
  const [modelConfig, setModelConfig] = useState<AIModelConfig>(getDefaultModelConfig('openai'))
  const [systemPrompt, setSystemPrompt] = useState('')
  const [tab, setTab] = useState<TabType>('providers')

  // 新增 Provider 状态
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [newProviderName, setNewProviderName] = useState('')
  const [newProviderConfig, setNewProviderConfig] = useState<Partial<AIModelConfig>>({
    modelId: '',
    apiKey: '',
    baseUrl: '',
    maxTokens: 4096,
    temperature: 0.7,
    enabled: true,
  })

  // UI状态
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [allProviders, setAllProviders] = useState<string[]>(['openai', 'claude', 'gemini'])

  // 预定义的 Provider 列表
  const builtinProviders = ['openai', 'claude', 'gemini'] as const

  // 初始化表单
  useEffect(() => {
    if (config) {
      const provider = config.provider || 'openai'
      setCurrentProvider(provider)
      setModelConfig(config.models[provider] || getDefaultModelConfig('openai'))
      setSystemPrompt(config.systemPrompt || '')

      // 加载所有 Provider 列表
      loadAllProviders()
    }
  }, [config])

  // 加载所有 Provider
  const loadAllProviders = async () => {
    const providers = await getAllProviders()
    setAllProviders(providers)
  }

  // 切换Provider时更新默认配置
  const handleProviderChange = (newProvider: string) => {
    if (!newProvider) return
    
    setCurrentProvider(newProvider)
    const existingConfig = config?.models[newProvider]
    setModelConfig(existingConfig || getDefaultModelConfig(newProvider))
    setTestResult(null)
  }

  // 更新模型配置
  const updateModelConfig = (updates: Partial<AIModelConfig>) => {
    setModelConfig(prev => ({ ...prev, ...updates }))
    setTestResult(null)
  }

  // 测试连接
  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await testAIConnection(currentProvider as any, modelConfig)
      setTestResult(result)
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : '测试失败',
      })
    } finally {
      setIsTesting(false)
    }
  }

  // 保存配置
  const handleSave = async () => {
    setIsSaving(true)

    try {
      await updateConfig({
        provider: currentProvider,
        systemPrompt,
        models: {
          ...(config?.models || {}),
          [currentProvider]: modelConfig,
        } as any,
      })
      closeSettings()
    } catch (err) {
      console.error('Failed to save config:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // 添加新 Provider
  const handleAddProvider = async () => {
    if (!newProviderName.trim()) {
      alert('请输入 Provider 名称')
      return
    }

    if (builtinProviders.includes(newProviderName as any)) {
      alert('不能使用预定义的 Provider 名称')
      return
    }

    if (config?.models[newProviderName]) {
      alert('Provider 名称已存在')
      return
    }

    const validation = validateModelConfig(newProviderConfig as AIModelConfig)
    if (!validation.valid) {
      alert(validation.message)
      return
    }

    try {
      await updateConfig({
        models: {
          ...(config?.models || {}),
          [newProviderName]: newProviderConfig as AIModelConfig,
        } as any,
      })

      setIsAddingProvider(false)
      setNewProviderName('')
      setNewProviderConfig({
        modelId: '',
        apiKey: '',
        baseUrl: '',
        maxTokens: 4096,
        temperature: 0.7,
        enabled: true,
      })

      // 重新加载 Provider 列表
      await loadAllProviders()
      setCurrentProvider(newProviderName)
      setModelConfig(newProviderConfig as AIModelConfig)

      alert('Provider 添加成功')
    } catch (err) {
      console.error('Failed to add provider:', err)
      alert('添加失败')
    }
  }

  // 删除 Provider
  const handleDeleteProvider = async (providerName: string) => {
    if (builtinProviders.includes(providerName as any)) {
      alert('不能删除预定义的 Provider')
      return
    }

    if (!confirm(`确定要删除 "${providerName}" 吗？`)) {
      return
    }

    try {
      await deleteProvider(providerName)
      await loadAllProviders()

      // 如果删除的是当前选中的 Provider，切换到 openai
      if (currentProvider === providerName) {
        setCurrentProvider('openai')
        setModelConfig(config?.models['openai'] || getDefaultModelConfig('openai'))
      }

      alert('删除成功')
    } catch (err) {
      console.error('Failed to delete provider:', err)
      alert('删除失败')
    }
  }

  // 保存系统提示词
  const handleSaveSystemPrompt = async () => {
    setIsSaving(true)

    try {
      await updateConfig({ systemPrompt })
      alert('保存成功')
    } catch (err) {
      console.error('Failed to save system prompt:', err)
      alert('保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isSettingsOpen) {
    return null
  }

  const helpInfo = getProviderHelpInfo(currentProvider)
  const defaultModels = getProviderDefaultModels(currentProvider)
  const isBuiltin = builtinProviders.includes(currentProvider as any)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeSettings}
      />

      {/* 设置面板 */}
      <div
        className={cn(
          'relative bg-background border rounded-xl shadow-2xl',
          'w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden',
          'flex flex-col',
          'animate-in zoom-in-95 duration-200'
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">AI 设置</h2>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b">
          <button
            onClick={() => setTab('providers')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              tab === 'providers'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Provider 配置
          </button>
          <button
            onClick={() => setTab('settings')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              tab === 'settings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            系统设置
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'providers' && (
            <div className="p-4 space-y-6">
              {/* Provider 列表 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">选择 Provider</label>
                  <button
                    onClick={() => setIsAddingProvider(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {allProviders.map((p) => (
                    <div
                      key={p}
                      className={cn(
                        'relative flex items-center justify-between p-3 rounded-lg border transition-colors',
                        currentProvider === p
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background hover:bg-muted border-border'
                      )}
                    >
                      <button
                        onClick={() => handleProviderChange(p)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium text-sm">{getProviderDisplayName(p)}</div>
                        {config?.provider === p && (
                          <div className="text-xs text-primary flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            当前使用
                          </div>
                        )}
                      </button>
                      {!isBuiltin && (
                        <button
                          onClick={() => handleDeleteProvider(p)}
                          className="p-1.5 rounded hover:bg-muted text-destructive"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider 配置表单 */}
              {!isAddingProvider && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{getProviderDisplayName(currentProvider)} 配置</h3>

                  {/* API 密钥 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">API 密钥</label>
                      {helpInfo.apiKeyUrl && (
                        <a
                          href={helpInfo.apiKeyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          获取密钥
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={modelConfig.apiKey}
                        onChange={(e) => updateModelConfig({ apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 pr-10 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* API 地址 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API 地址</label>
                    <input
                      type="text"
                      value={modelConfig.baseUrl}
                      onChange={(e) => updateModelConfig({ baseUrl: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* 模型选择 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">模型</label>
                    {defaultModels.length > 0 ? (
                      <select
                        value={modelConfig.modelId}
                        onChange={(e) => updateModelConfig({ modelId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">选择模型</option>
                        {defaultModels.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={modelConfig.modelId}
                        onChange={(e) => updateModelConfig({ modelId: e.target.value })}
                        placeholder="gpt-4o-mini"
                        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                  </div>

                  {/* 高级设置 */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium flex items-center gap-1">
                      <span>高级设置</span>
                      <span className="text-muted-foreground group-open:rotate-90 transition-transform">
                        ▶
                      </span>
                    </summary>

                    <div className="mt-4 space-y-4 pl-2">
                      {/* 温度 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">温度 (Temperature)</label>
                          <span className="text-sm text-muted-foreground">
                            {modelConfig.temperature.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={modelConfig.temperature}
                          onChange={(e) =>
                            updateModelConfig({ temperature: parseFloat(e.target.value) })
                          }
                          className="w-full"
                        />
                      </div>

                      {/* 最大Token */}
                      <div className="space-y-2">
                        <label className="text-sm">最大输出长度 (Max Tokens)</label>
                        <input
                          type="number"
                          min="1"
                          max="128000"
                          value={modelConfig.maxTokens}
                          onChange={(e) =>
                            updateModelConfig({ maxTokens: parseInt(e.target.value) || 4096 })
                          }
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </details>

                  {/* 测试结果 */}
                  {testResult && (
                    <div
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg text-sm',
                        testResult.success
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {testResult.success ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  {/* 底部按钮 */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <button
                      onClick={handleTestConnection}
                      disabled={!modelConfig.apiKey || !modelConfig.modelId || isTesting}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                        'border border-border hover:bg-muted transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          测试中...
                        </>
                      ) : (
                        '测试连接'
                      )}
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto',
                        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        '保存设置'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 添加新 Provider 表单 */}
              {isAddingProvider && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">添加自定义 Provider</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider 名称</label>
                    <input
                      type="text"
                      value={newProviderName}
                      onChange={(e) => setNewProviderName(e.target.value)}
                      placeholder="deepseek"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground">
                      名称将用于标识此 Provider，不能与预定义 Provider 重复
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">API 密钥</label>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={newProviderConfig.apiKey}
                      onChange={(e) =>
                        setNewProviderConfig(prev => ({ ...prev, apiKey: e.target.value }))
                      }
                      placeholder="sk-..."
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">API 地址</label>
                    <input
                      type="text"
                      value={newProviderConfig.baseUrl}
                      onChange={(e) =>
                        setNewProviderConfig(prev => ({ ...prev, baseUrl: e.target.value }))
                      }
                      placeholder="https://api.deepseek.com"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">模型</label>
                    <input
                      type="text"
                      value={newProviderConfig.modelId}
                      onChange={(e) =>
                        setNewProviderConfig(prev => ({ ...prev, modelId: e.target.value }))
                      }
                      placeholder="deepseek-chat"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* 底部按钮 */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <button
                      onClick={() => setIsAddingProvider(false)}
                      className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors"
                    >
                      取消
                    </button>

                    <button
                      onClick={handleAddProvider}
                      disabled={isSaving}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto',
                        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          添加中...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          添加
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="p-4 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">系统提示词</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={6}
                  placeholder="你是一个专业的文档助手，请根据用户的问题，提供准确、有帮助的回答。"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  系统提示词用于定义 AI 助手的行为和角色
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <button
                  onClick={handleSaveSystemPrompt}
                  disabled={isSaving}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto',
                    'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      保存提示词
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}