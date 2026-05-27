import { STORAGE_KEY } from './authStorage.js'

/**
 * 从 Vite 注入的环境变量读取 API 根地址。
 * 未配置时返回空字符串：此时 path 需写绝对 URL，或继续走 mock。
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || String(raw).trim() === '') return ''
  return String(raw).replace(/\/+$/, '')
}

/**
 * 后端统一包一层：{ success, code, message, data }
 * - success === false：抛错（业务失败但 HTTP 可能仍是 200）
 * - success === true：返回 data（便于调用方直接拿列表/对象）
 */
export function unwrapApiResponse(payload) {
  if (payload == null || typeof payload !== 'object') return payload
  if (!('success' in payload)) return payload

  if (payload.success === false) {
    const msg =
      typeof payload.message === 'string'
        ? payload.message
        : JSON.stringify(payload.message ?? '请求失败')
    const err = new Error(msg)
    err.code = payload.code
    err.data = payload.data
    throw err
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'data')) {
    const inner = payload.data
    // 部分接口 success 下 data 为 null，但 token 与字段挂在根上与 data 同级
    if (inner == null) return payload
    if (typeof inner !== 'object' || Array.isArray(inner)) return inner
    // 登录等场景：用户信息在 data 内，role / authorities 等在 success 包裹层，只 return inner 会丢角色
    const merged = { ...inner }
    for (const key of Object.keys(payload)) {
      if (key === 'data' || key === 'success') continue
      if (!Object.prototype.hasOwnProperty.call(merged, key)) merged[key] = payload[key]
    }
    return merged
  }
  return payload
}

/**
 * 拼接完整 URL：base + path（path 应以 / 开头）
 */
export function apiUrl(path) {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}

/**
 * 小型 fetch 封装：JSON、Bearer、ApiResponse 解包、错误解析
 *
 * @param {string} path 如 '/campus/Search'
 * @param {RequestInit & { json?: unknown, skipAuth?: boolean }} options
 */
export async function request(path, options = {}) {
  const { json, skipAuth, headers: extraHeaders, ...rest } = options
  const url = apiUrl(path)

  const headers = new Headers(extraHeaders ?? {})

  let body = rest.body
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json;charset=UTF-8')
    body = JSON.stringify(json)
  }

  if (!skipAuth) {
    const token = localStorage.getItem(STORAGE_KEY)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body,
  })

  const text = await res.text()
  let parsed
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.message === 'string') msg = parsed.message
      else if (parsed.success === false && parsed.message != null) {
        msg =
          typeof parsed.message === 'string'
            ? parsed.message
            : JSON.stringify(parsed.message)
      }
    } else if (typeof parsed === 'string' && parsed) {
      msg = parsed
    }
    const err = new Error(msg)
    err.status = res.status
    err.data = parsed
    throw err
  }

  return unwrapApiResponse(parsed)
}
