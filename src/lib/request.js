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

/** 常见请求字段中文名（用于校验错误提示） */
const FIELD_LABELS = {
  campus_id: '校区ID',
  campus_name: '校区名称',
  building_id: '建筑ID',
  building_name: '建筑名称',
  building_type: '建筑类型',
  facility_id: '设施ID',
  facility_name: '设施名称',
  facility_type: '设施类型',
  teacher_id: '教师ID',
  teacher_name: '教师姓名',
  department: '院系',
  email: '邮箱',
  course_id: '课程编号',
  course_name: '课程名称',
  offering_department: '开课院系',
  semester: '学期',
  section_no: '班次',
  teach_role: '授课角色',
  event_id: '活动ID',
  event_name: '活动名称',
  organizer: '主办单位',
  username: '用户名',
  password: '密码',
  query: '查询内容',
}

/** Pydantic / FastAPI 校验类型 → 中文说明 */
const VALIDATION_TYPE_MESSAGES = {
  list_type: '应为列表格式',
  missing: '为必填项',
  string_type: '应为文本',
  int_type: '应为整数',
  float_type: '应为数字',
  bool_type: '应为布尔值',
  int_parsing: '整数格式不正确',
  float_parsing: '数字格式不正确',
  bool_parsing: '布尔格式不正确',
  enum: '取值不在允许范围内',
  value_error: '',
  type_error: '类型不正确',
}

/** HTTP 状态无具体文案时的默认提示 */
const HTTP_STATUS_MESSAGES = {
  400: '请求参数有误',
  401: '未登录或登录已过期，请重新登录',
  403: '没有权限执行此操作',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '数据冲突，请刷新后重试',
  422: '请求参数校验失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误，无法连接后端服务',
  503: '服务暂时不可用，请稍后再试',
  504: '网关超时，请稍后再试',
}

/** 业务 code（与 HTTP 可能相同）默认提示 */
const BUSINESS_CODE_MESSAGES = {
  400: '请求参数有误',
  401: '未登录或登录已过期，请重新登录',
  403: '没有权限执行此操作',
  404: '资源不存在',
  422: '请求参数校验失败',
  500: '操作失败，请稍后重试',
}

const GENERIC_VALIDATION_MESSAGES = new Set([
  'request validation failed',
  'validation error',
  'unprocessable entity',
])

function createApiError(message, extras = {}) {
  const err = new Error(message)
  if (extras.status != null) err.status = extras.status
  if (extras.code != null) err.code = extras.code
  if (extras.data !== undefined) err.data = extras.data
  if (extras.kind) err.kind = extras.kind
  if (extras.cause) err.cause = extras.cause
  return err
}

function locToFieldName(loc) {
  if (!Array.isArray(loc) || !loc.length) return ''
  const last = loc[loc.length - 1]
  return typeof last === 'string' || typeof last === 'number'
    ? String(last)
    : ''
}

function isValidationItem(item) {
  return (
    item != null &&
    typeof item === 'object' &&
    (item.msg != null || item.type != null || item.loc != null)
  )
}

/** 从响应体提取 FastAPI 风格校验错误数组 */
export function extractValidationErrors(parsed) {
  if (!parsed || typeof parsed !== 'object') return []
  if (Array.isArray(parsed.detail) && parsed.detail.some(isValidationItem)) {
    return parsed.detail
  }
  if (Array.isArray(parsed.data) && parsed.data.some(isValidationItem)) {
    return parsed.data
  }
  return []
}

function shortenEnglishMsg(msg) {
  const s = String(msg ?? '').trim()
  if (!s) return ''
  if (/input should be a valid list/i.test(s)) return '应为列表格式'
  if (/field required/i.test(s)) return '为必填项'
  if (/string type/i.test(s)) return '应为文本'
  if (/int type|valid integer/i.test(s)) return '应为整数'
  if (/float type|valid number/i.test(s)) return '应为数字'
  return s
}

/** 单条校验错误 → 中文 */
function formatValidationItem(item) {
  if (typeof item === 'string') return item.trim()
  if (!item || typeof item !== 'object') return ''

  const field = locToFieldName(item.loc)
  const label = field ? (FIELD_LABELS[field] ?? field) : ''
  const typeHint = VALIDATION_TYPE_MESSAGES[item.type] ?? ''
  const msgHint = shortenEnglishMsg(item.msg)

  if (item.type === 'list_type' && label) {
    const raw = item.input
    if (typeof raw === 'string' && raw.trim()) {
      return `「${label}」应为列表格式（例如 ["${raw.trim()}"]，不能是单个文本）`
    }
    return `「${label}」应为列表格式（例如 ["值1","值2"]）`
  }

  if (item.type === 'string_type' && label) {
    const raw = item.input
    if (Array.isArray(raw) && raw.length) {
      return `「${label}」应为单个文本（例如 "${String(raw[0]).trim()}"，不能是数组）`
    }
    return `「${label}」应为文本`
  }

  if (label && typeHint) return `「${label}」${typeHint}`
  if (label && msgHint) return `「${label}」${msgHint}`
  if (typeHint) return typeHint
  if (msgHint) return msgHint
  return ''
}

/** FastAPI detail / data 校验数组 → 中文汇总 */
export function formatValidationErrors(items) {
  if (!Array.isArray(items)) return ''
  return items.map(formatValidationItem).filter(Boolean).join('；')
}

function isGenericValidationMessage(msg) {
  return GENERIC_VALIDATION_MESSAGES.has(String(msg ?? '').trim().toLowerCase())
}

/** 将英文泛化错误替换为业务友好提示 */
function applySpecialCases(msg, { status, code } = {}) {
  const s = String(msg ?? '').trim()
  const st = status ?? code
  if (st === 500 && /^internal server error$/i.test(s)) {
    return '有外键依赖，删除失败'
  }
  if (/foreign key|constraint|referenced/i.test(s)) {
    return '有外键依赖，删除失败'
  }
  if (/duplicate|unique constraint|already exists/i.test(s)) {
    return '记录已存在，请勿重复提交'
  }
  if (/not found/i.test(s)) {
    return '资源不存在'
  }
  if (/unauthorized|invalid token|token expired/i.test(s)) {
    return '未登录或登录已过期，请重新登录'
  }
  if (/forbidden|permission denied/i.test(s)) {
    return '没有权限执行此操作'
  }
  return s
}

function messageFromStatus(status) {
  return HTTP_STATUS_MESSAGES[status] ?? `请求失败（HTTP ${status}）`
}

function messageFromBusinessCode(code) {
  return BUSINESS_CODE_MESSAGES[code] ?? `操作失败（错误码 ${code}）`
}

function resolveNetworkErrorMessage(cause) {
  if (cause?.name === 'AbortError') return '请求已取消'
  const msg = String(cause?.message ?? '')
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    const base = getApiBaseUrl()
    return base
      ? '网络连接失败，请检查网络或确认后端服务已启动'
      : '网络连接失败，请检查网络；若使用本地 mock，请确认未误配 API 地址'
  }
  return '网络异常，请稍后重试'
}

/**
 * 业务失败（success === false）文案
 */
function resolveBusinessErrorMessage(code, message, data) {
  const validation = extractValidationErrors({ detail: data, data })
  const formatted = formatValidationErrors(
    validation.length ? validation : Array.isArray(data) ? data : [],
  )
  if (formatted) return formatted

  const rawMsg =
    typeof message === 'string'
      ? message.trim()
      : message != null
        ? JSON.stringify(message)
        : ''

  const special = applySpecialCases(rawMsg, { code })
  if (special && (!rawMsg || !isGenericValidationMessage(rawMsg))) {
    return special
  }
  if (special && isGenericValidationMessage(rawMsg) && code != null) {
    return applySpecialCases(messageFromBusinessCode(code), { code }) || special
  }
  if (rawMsg && !isGenericValidationMessage(rawMsg)) {
    return applySpecialCases(rawMsg, { code })
  }
  if (code != null) return messageFromBusinessCode(code)
  return '请求失败'
}

/**
 * HTTP 非 2xx 文案
 */
function resolveHttpErrorMessage(parsed, status) {
  const validation = extractValidationErrors(parsed)
  const formatted = formatValidationErrors(validation)
  if (formatted) return formatted

  let rawMsg = ''
  if (parsed && typeof parsed === 'object') {
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      rawMsg = parsed.message.trim()
    } else if (parsed.success === false && parsed.message != null) {
      rawMsg =
        typeof parsed.message === 'string'
          ? parsed.message.trim()
          : JSON.stringify(parsed.message)
    } else if (typeof parsed.detail === 'string' && parsed.detail.trim()) {
      rawMsg = parsed.detail.trim()
    } else if (parsed.detail != null) {
      rawMsg = formatValidationErrors(
        Array.isArray(parsed.detail) ? parsed.detail : [parsed.detail],
      )
    }
  } else if (typeof parsed === 'string' && parsed.trim()) {
    rawMsg = parsed.trim()
  }

  const special = applySpecialCases(rawMsg, { status })
  if (special && rawMsg && !isGenericValidationMessage(rawMsg)) {
    return special
  }
  if (rawMsg && !isGenericValidationMessage(rawMsg)) {
    return applySpecialCases(rawMsg, { status })
  }
  if (special && isGenericValidationMessage(rawMsg)) {
    return messageFromStatus(status)
  }
  return messageFromStatus(status)
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
    const msg = resolveBusinessErrorMessage(
      payload.code,
      payload.message,
      payload.data,
    )
    throw createApiError(msg, {
      code: payload.code,
      data: payload.data,
      kind: 'business',
    })
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'data')) {
    const inner = payload.data
    if (inner == null) return payload
    if (typeof inner !== 'object' || Array.isArray(inner)) return inner
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

  let res
  try {
    res = await fetch(url, {
      ...rest,
      headers,
      body,
    })
  } catch (cause) {
    throw createApiError(resolveNetworkErrorMessage(cause), {
      kind: 'network',
      cause,
    })
  }

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
    const msg = resolveHttpErrorMessage(parsed, res.status)
    throw createApiError(msg, {
      status: res.status,
      code: parsed?.code ?? res.status,
      data: parsed,
      kind: 'http',
    })
  }

  return unwrapApiResponse(parsed)
}

const ERROR_KIND_FALLBACK = {
  network: '网络异常，请稍后重试',
  http: '请求失败',
  business: '操作失败',
  validation: '请求参数校验失败',
}

/**
 * 供页面展示：按错误类型返回统一中文文案（优先用 Error.message，已由 request 解析）
 */
export function formatApiError(error) {
  if (error == null) return ERROR_KIND_FALLBACK.business
  if (typeof error === 'string') return error.trim() || ERROR_KIND_FALLBACK.business

  const message = String(error.message ?? '').trim()
  if (message) return message

  const kind = error.kind
  if (kind && ERROR_KIND_FALLBACK[kind]) return ERROR_KIND_FALLBACK[kind]

  const status = error.status ?? error.code
  if (status != null) {
    return HTTP_STATUS_MESSAGES[status] ?? BUSINESS_CODE_MESSAGES[status] ?? `请求失败（${status}）`
  }

  return ERROR_KIND_FALLBACK.business
}
