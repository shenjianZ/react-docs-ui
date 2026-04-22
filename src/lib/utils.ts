import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toBase64(str: string) {
  return window.btoa(str)
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  // Fallback for non-secure contexts (HTTP without HTTPS)
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

const DANGEROUS_TAGS_RE = /<\/?(script|iframe|object|embed|form|input|textarea|select|button|applet|meta|link|base|svg)\b[^>]*>/gi
const EVENT_HANDLER_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JAVASCRIPT_URL_RE = /\s*(?:href|src|action|formaction|data)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAGS_RE, '')
    .replace(EVENT_HANDLER_RE, '')
    .replace(JAVASCRIPT_URL_RE, '')
}