export interface ReadingTimeResult {
  minutes: number
  words: number
  text: string
}

function isChinese(char: string): boolean {
  const code = char.charCodeAt(0)
  return code >= 0x4e00 && code <= 0x9fff
}

export function estimateReadingTime(
  content: string,
  lang: string = "zh-cn"
): ReadingTimeResult {
  if (!content) return { minutes: 0, words: 0, text: "" }

  // 去除 frontmatter
  let text = content
  if (text.startsWith("---\n")) {
    const endIndex = text.indexOf("\n---\n", 4)
    if (endIndex !== -1) text = text.slice(endIndex + 5)
  }

  // 去除代码块（不算阅读时间）
  text = text.replace(/```[\s\S]*?```/g, "")
  // 去除 HTML 标签
  text = text.replace(/<[^>]+>/g, "")
  // 去除 Markdown 图片/链接语法
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
  text = text.replace(/\[[^\]]*\]\([^)]*\)/g, "")
  // 去除 Markdown 标记符号
  text = text.replace(/[#*_~`>|]/g, "")

  let chineseChars = 0
  let englishWords = 0

  // 统计中文字符
  for (const char of text) {
    if (isChinese(char)) chineseChars++
  }

  // 统计英文单词（去除中文后的文本）
  const withoutChinese = text.replace(/[一-鿿]/g, " ")
  const words = withoutChinese.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z0-9]/.test(w))
  englishWords = words.length

  const totalWords = chineseChars + englishWords
  // 中文 300 字/分钟，英文 200 词/分钟，混合时加权
  const isZh = lang === "zh-cn"
  const wpm = isZh ? 300 : 200
  const minutes = Math.max(1, Math.ceil(totalWords / wpm))

  const text_label = isZh ? `${minutes} 分钟` : `${minutes} min read`

  return { minutes, words: totalWords, text: text_label }
}
