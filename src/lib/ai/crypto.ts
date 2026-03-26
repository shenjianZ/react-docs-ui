/**
 * API密钥加密/解密工具
 * 使用 Web Crypto API 的 AES-GCM 算法
 */

/** 存储键名 */
const STORAGE_KEY = 'ai-device-key'

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

/**
 * 获取设备指纹作为加密密钥的一部分
 * 使用多个浏览器特征生成相对唯一的标识
 */
async function getDeviceFingerprint(): Promise<string> {
  const components: string[] = []

  // 用户代理
  components.push(navigator.userAgent)

  // 语言
  components.push(navigator.language)

  // 平台
  components.push(navigator.platform)

  // 屏幕信息
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)

  // 时区
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // 硬件并发数
  components.push(String(navigator.hardwareConcurrency || 0))

  // 设备内存（如果可用）
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (nav.deviceMemory) {
    components.push(String(nav.deviceMemory))
  }

  // 触摸支持
  components.push(String(navigator.maxTouchPoints || 0))

  return components.join('|')
}

/**
 * 从密码派生加密密钥
 * 使用 PBKDF2 算法
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // 将密码转换为密钥材料
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // 派生 AES-GCM 密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 生成或获取存储的设备密钥
 */
async function getOrCreateDeviceKey(): Promise<string> {
  let deviceKey: string

  try {
    deviceKey = localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    deviceKey = ''
  }

  if (!deviceKey) {
    // 生成新的设备密钥
    const fingerprint = await getDeviceFingerprint()
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    deviceKey = `${fingerprint}:${randomPart}`

    try {
      localStorage.setItem(STORAGE_KEY, deviceKey)
    } catch {
      // 存储失败，使用内存中的密钥
    }
  }

  return deviceKey
}

/**
 * 加密API密钥
 * @param plaintext 明文API密钥
 * @returns 加密后的Base64字符串
 */
export async function encryptApiKey(plaintext: string): Promise<string> {
  if (!plaintext) {
    return ''
  }

  try {
    // 获取设备密钥
    const deviceKey = await getOrCreateDeviceKey()

    // 生成随机盐值
    const salt = crypto.getRandomValues(new Uint8Array(16))

    // 生成随机IV
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // 派生加密密钥
    const key = await deriveKey(deviceKey, salt)

    // 加密
    const encoder = new TextEncoder()
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    )

    // 组合：盐值 + IV + 密文
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)

    // 转为Base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Failed to encrypt API key:', error)
    throw new Error('加密失败')
  }
}

/**
 * 解密API密钥
 * @param encryptedBase64 加密后的Base64字符串
 * @returns 解密后的明文API密钥
 */
export async function decryptApiKey(encryptedBase64: string): Promise<string> {
  if (!encryptedBase64) {
    return ''
  }

  try {
    // 获取设备密钥
    const deviceKey = await getOrCreateDeviceKey()

    // 从Base64解码
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split('')
        .map(c => c.charCodeAt(0))
    )

    // 提取盐值、IV和密文
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const encrypted = combined.slice(28)

    // 派生解密密钥
    const key = await deriveKey(deviceKey, salt)

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Failed to decrypt API key:', error)
    // 解密失败可能是因为设备密钥变化，返回空字符串
    return ''
  }
}

/**
 * 检查是否支持加密
 */
export function isCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined'
}

/**
 * 简单加密（用于不支持Web Crypto的环境降级）
 * 注意：这不是真正的安全加密，仅用于兼容
 */
export function simpleEncrypt(plaintext: string): string {
  if (!plaintext) return ''

  // 简单的XOR混淆 + Base64
  const key = 'react-docs-ui-ai-key'
  const result: number[] = []

  for (let i = 0; i < plaintext.length; i++) {
    result.push(plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }

  return btoa(String.fromCharCode(...result))
}

/**
 * 简单解密
 */
export function simpleDecrypt(encrypted: string): string {
  if (!encrypted) return ''

  try {
    const key = 'react-docs-ui-ai-key'
    const decoded = atob(encrypted)
    const result: string[] = []

    for (let i = 0; i < decoded.length; i++) {
      result.push(String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)))
    }

    return result.join('')
  } catch {
    return ''
  }
}
