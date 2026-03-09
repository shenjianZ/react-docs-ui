function isChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text)
}

export function tokenize(text: string): string[] {
  if (!text) return []
  
  const tokens: string[] = []
  const parts = text.split(/(\s+|[，。！？、；：""''（）【】《》\n\r]+)/)
  
  for (const part of parts) {
    if (!part.trim()) continue
    
    if (isChinese(part)) {
      tokens.push(part)
    } else {
      const words = part.toLowerCase().split(/[^a-zA-Z0-9]+/).filter(w => w.length > 1)
      tokens.push(...words)
    }
  }
  
  return [...new Set(tokens.filter(t => t.length > 1))]
}
