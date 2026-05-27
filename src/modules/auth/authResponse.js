/** 逗号分隔，如 1,2；表示 role_id / roleId 为其中任一数值时视为管理员 */
function adminNumericRoleIds() {
  const raw = import.meta.env?.VITE_AUTH_ADMIN_ROLE_IDS
  if (raw == null || String(raw).trim() === '') return new Set([1])
  const s = new Set()
  for (const p of String(raw).split(/[,;\s]+/)) {
    const n = Number(String(p).trim())
    if (Number.isFinite(n)) s.add(n)
  }
  return s.size > 0 ? s : new Set([1])
}

/** 宽松解码 JWT 第二段 JSON（仅用于读 claims，不做签名校验） */
function decodeJwtPayload(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const json = typeof atob === 'function' ? atob(b64 + pad) : Buffer.from(b64 + pad, 'base64').toString('utf8')
    const o = JSON.parse(json)
    return o && typeof o === 'object' && !Array.isArray(o) ? o : null
  } catch {
    return null
  }
}

const AUTH_TOKEN_KEYS = [
  'token',
  'accessToken',
  'access_token',
  'jwt',
  'bearerToken',
  'bearer_token',
  'loginToken',
  'login_token',
  'authToken',
  'auth_token',
  'id_token',
  'session_token',
  'sessionToken',
]

/** 常见三段式 JWT（宽松匹配，避免把普通短字符串当 token） */
function looksLikeJwt(s) {
  if (typeof s !== 'string') return false
  const t = s.trim()
  if (t.length < 20) return false
  const parts = t.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}

function stringToken(v) {
  if (v == null) return null
  if (typeof v === 'string') {
    const t = v.trim()
    return t !== '' ? t : null
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return null
}

/** 将后端各种「整段响应 / data」收成统一对象再解析 */
function normalizeLoginDataShape(raw) {
  if (raw == null) return raw
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (looksLikeJwt(t)) return { access_token: t }
    try {
      const j = JSON.parse(t)
      if (j != null && j !== raw) return normalizeLoginDataShape(j)
    } catch {
      /* ignore */
    }
    return raw
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const t0 = stringToken(raw[0])
    if (t0) {
      const o = { access_token: t0 }
      if (raw[1] != null && typeof raw[1] === 'object' && !Array.isArray(raw[1])) {
        o.user = raw[1]
      }
      return o
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const d = raw.data
    if (typeof d === 'string') {
      const dt = d.trim()
      if (looksLikeJwt(dt)) return { ...raw, access_token: dt }
      try {
        const j = JSON.parse(dt)
        if (j != null && typeof j === 'object') return normalizeLoginDataShape(j)
      } catch {
        /* ignore */
      }
    }
  }
  return raw
}

/** 若 data 内还有一层常见业务对象，则展开后再解析 token / 用户 */
function unwrapAuthDataLayer(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data
  const inner =
    data.data ??
    data.result ??
    data.loginResult ??
    data.payload ??
    data.body ??
    data.info ??
    data.record ??
    data.value
  if (inner == null) return data
  if (typeof inner === 'string') {
    const t = inner.trim()
    if (looksLikeJwt(t)) return { access_token: t }
    try {
      const j = JSON.parse(t)
      if (j != null && typeof j === 'object' && !Array.isArray(j)) return j
    } catch {
      /* ignore */
    }
    return data
  }
  if (typeof inner !== 'object' || Array.isArray(inner)) return data
  const innerHasToken = AUTH_TOKEN_KEYS.some((k) => stringToken(inner[k]))
  const innerHasUser =
    inner.user != null ||
    inner.userInfo != null ||
    inner.user_id != null ||
    inner.userId != null ||
    inner.id != null ||
    (typeof inner.username === 'string' && inner.username !== '') ||
    (typeof inner.username === 'number') ||
    (typeof inner.name === 'string' && inner.name !== '')
  if (innerHasToken || innerHasUser) return inner
  return data
}

/** 最多展开几层，避免 { data: { data: { access_token } } } 认不到 */
function unwrapAuthDataLayers(data, maxDepth = 5) {
  let cur = data
  for (let i = 0; i < maxDepth; i++) {
    const next = unwrapAuthDataLayer(cur)
    if (next === cur) break
    cur = next
  }
  return cur
}

function pickAuthToken(data) {
  if (!data || typeof data !== 'object') return null
  const authz = data.authorization ?? data.Authorization
  if (typeof authz === 'string') {
    const m = authz.match(/^Bearer\s+(\S+)/i)
    if (m) return m[1].trim()
  }
  for (const k of AUTH_TOKEN_KEYS) {
    const t = stringToken(data[k])
    if (t) return t
  }
  return null
}

function usernameFromRest(rest) {
  const u = rest.username ?? rest.name ?? rest.nickname ?? rest.account
  if (u != null && u !== '') return String(u)
  return null
}

function pickAuthUserPayload(data) {
  if (!data || typeof data !== 'object') return null
  const nested =
    data.user ??
    data.userInfo ??
    data.account ??
    data.profile ??
    data.loginUser ??
    (data.principal && typeof data.principal === 'object' && !Array.isArray(data.principal)
      ? data.principal
      : null)
  if (nested && typeof nested === 'object') return nested

  const rest = { ...data }
  for (const k of AUTH_TOKEN_KEYS) delete rest[k]
  delete rest.success
  delete rest.message
  delete rest.code
  delete rest.authorization
  delete rest.Authorization
  delete rest.token_type
  delete rest.tokenType
  const hasUserShape =
    rest.user_id != null ||
    rest.userId != null ||
    rest.id != null ||
    usernameFromRest(rest) != null
  return hasUserShape ? rest : null
}

/** 将后端字符串/枚举形式的角色映射为 admin | user */
function normalizeRoleString(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (adminNumericRoleIds().has(value)) return 'admin'
    if (value === 0) return 'user'
    return null
  }
  const t = String(value).trim().toLowerCase()
  if (!t) return null
  const adminTokens = new Set([
    'admin',
    'administrator',
    '管理员',
    'role_admin',
    'role-admin',
    'admin_role',
    'superadmin',
    'root',
  ])
  if (adminTokens.has(t) || t.endsWith('_admin') || t.includes('role_admin')) return 'admin'
  const userTokens = new Set(['user', 'member', '普通用户', 'student', 'users', 'role_user', 'role-user'])
  if (userTokens.has(t)) return 'user'
  return null
}

/**
 * 从后端用户对象上读取角色（兼容 role / user_type / role_id / authorities 等）。
 */
function coerceFrontendRole(u) {
  if (!u || typeof u !== 'object') return 'user'
  if (u.is_admin === true || u.isAdmin === true || u.admin === true) return 'admin'

  for (const k of ['role_id', 'roleId']) {
    if (u[k] == null || u[k] === '') continue
    const n = Number(u[k])
    if (!Number.isFinite(n)) continue
    if (adminNumericRoleIds().has(n)) return 'admin'
    if (n === 0) return 'user'
  }

  const stringKeys = [
    'role',
    'user_role',
    'userRole',
    'role_name',
    'roleName',
    'user_type',
    'userType',
    'type',
    'identity',
    'permission',
    'permissions',
    'scope',
  ]
  for (const k of stringKeys) {
    if (u[k] == null || u[k] === '') continue
    const r = normalizeRoleString(u[k])
    if (r) return r
  }

  if (typeof u.scope === 'string' && u.scope.toLowerCase().includes('admin')) return 'admin'

  if (Array.isArray(u.roles)) {
    for (const x of u.roles) {
      const r = normalizeRoleString(x)
      if (r === 'admin') return 'admin'
    }
  }
  if (Array.isArray(u.authorities)) {
    for (const x of u.authorities) {
      const a = typeof x === 'string' ? x : x?.authority ?? x?.name ?? x?.role
      const r = normalizeRoleString(a)
      if (r === 'admin') return 'admin'
    }
  }

  return 'user'
}

/** 把后端用户字段规范成前端 Me 页使用的结构（供登录解析与 localStorage 恢复共用） */
export function normalizeBackendUser(u) {
  if (!u || typeof u !== 'object') return null
  const idRaw = u.user_id ?? u.userId ?? u.id
  let user_id = null
  if (idRaw != null && idRaw !== '') {
    const n = Number(idRaw)
    user_id = Number.isFinite(n) ? n : null
  }
  const username =
    u.username != null && u.username !== ''
      ? String(u.username)
      : u.name != null && u.name !== ''
        ? String(u.name)
        : idRaw != null && idRaw !== ''
          ? String(idRaw)
          : null
  if (username == null || username === '') return null
  return {
    user_id,
    username,
    role: coerceFrontendRole(u),
    created_at: u.created_at ?? u.createdAt ?? u.create_time ?? u.createTime ?? null,
  }
}

function normalizeFormUsername(formUsername) {
  if (formUsername == null || formUsername === '') return ''
  return String(formUsername)
}

/**
 * 从登录/注册接口解包后的 data 解析 token 与用户；仅 token 时用表单用户名补全。
 * @returns {{ token: string | null, user: ReturnType<typeof normalizeBackendUser> }}
 */
export function resolveAuthSessionPayload(data, formUsername) {
  const name = normalizeFormUsername(formUsername)
  const shaped = normalizeLoginDataShape(data)
  const payload = unwrapAuthDataLayers(shaped)
  const token = pickAuthToken(payload)
  let rawUser = pickAuthUserPayload(payload)
  if (!rawUser && token) {
    rawUser = { username: name }
  }
  // 角色有时在 payload 顶层、与嵌套 user 分离，合并进 rawUser 再规范化
  if (rawUser && payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const hasRoleHint =
      rawUser.role != null ||
      rawUser.user_role != null ||
      rawUser.userRole != null ||
      rawUser.user_type != null ||
      rawUser.role_id != null ||
      rawUser.is_admin != null
    if (!hasRoleHint) {
      for (const k of ['role', 'user_role', 'userRole', 'user_type', 'userType', 'role_id', 'roleId']) {
        if (payload[k] != null && payload[k] !== '') {
          rawUser = { ...rawUser, [k]: payload[k] }
          break
        }
      }
    }
  }
  const user = normalizeBackendUser(rawUser)
  return { token, user }
}
