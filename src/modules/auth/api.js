import {

  findMockUserByCredentials,

  getMockUserById,

  registerMockUser,

  setMockSession,

  clearMockSession,

  getActiveUserId,

  syncMockSessionFromToken,

} from '../../mock/data.js'

import { getApiBaseUrl, request } from '../../lib/request.js'

import { apiPaths } from '../../config/apiPaths.js'

import {

  STORAGE_KEY,

  STORAGE_USER_ID_KEY,

  STORAGE_USER_JSON_KEY,

} from '../../lib/authStorage.js'

import {

  normalizeBackendUser,

  resolveAuthSessionPayload,

} from './authResponse.js'



export {

  STORAGE_KEY,

  STORAGE_USER_ID_KEY,

  STORAGE_USER_JSON_KEY,

} from '../../lib/authStorage.js'



export function getStoredToken() {

  return localStorage.getItem(STORAGE_KEY)

}



export function persistToken(token) {

  if (token) localStorage.setItem(STORAGE_KEY, token)

  else localStorage.removeItem(STORAGE_KEY)

}



/** 刷新页面后根据 localStorage 恢复会话，再读用户信息 */

export async function restoreSession() {

  syncMockSessionFromToken(getStoredToken())

  return await getMe()

}



function toPublicUser(row) {

  if (!row) return null

  const { password: _p, ...rest } = row

  return rest

}



function readStoredBackendUser() {

  try {

    const raw = localStorage.getItem(STORAGE_USER_JSON_KEY)

    if (!raw) return null

    return normalizeBackendUser(JSON.parse(raw))

  } catch {

    return null

  }

}



function persistBackendUser(user) {

  if (user && typeof user === 'object') {

    localStorage.setItem(STORAGE_USER_JSON_KEY, JSON.stringify(user))

  } else {

    localStorage.removeItem(STORAGE_USER_JSON_KEY)

  }

}



/** 当前用户：mock 用内存会话；后端无 getMe 时读登录时写入的 localStorage */

export async function getMe() {

  if (getApiBaseUrl()) {

    const cached = readStoredBackendUser()

    if (getStoredToken()) {

      return cached

    }

    if (cached) {

      return cached

    }

    return null

  }

  const id = getActiveUserId()

  if (id == null) return null

  const row = getMockUserById(id)

  return toPublicUser(row)

}



function applyBackendSession(token, user) {
  if (token) {
    persistToken(token)
  } else {
    persistToken(null)
  }

  if (user.user_id != null && !Number.isNaN(user.user_id)) {

    localStorage.setItem(STORAGE_USER_ID_KEY, String(user.user_id))

  } else {

    localStorage.removeItem(STORAGE_USER_ID_KEY)

  }

  setMockSession(user.user_id ?? null, token)

  persistBackendUser(user)

}



/**

 * 登录：配置了 VITE_API_BASE_URL 则走后端；否则走本地 mock。

 * 解析多种常见 data 形态见 authResponse.js。

 */

export async function login(username, password) {

  if (getApiBaseUrl()) {

    const data = await request(apiPaths.authLogin, {

      method: 'POST',

      json: { username, password },

      skipAuth: true,

    })

    const { token, user } = resolveAuthSessionPayload(data, username)

    if (!user) {

      throw new Error('登录响应缺少用户信息')

    }

    applyBackendSession(token, user)

    return { token, user }

  }



  const row = findMockUserByCredentials(username, password)

  if (!row) {

    throw new Error('用户名或密码错误')

  }

  const token = `mock-${row.user_id}`

  setMockSession(row.user_id, token)

  persistToken(token)

  localStorage.removeItem(STORAGE_USER_ID_KEY)

  localStorage.removeItem(STORAGE_USER_JSON_KEY)

  return { token, user: toPublicUser(row) }

}



/**

 * 注册：POST /auth/register。普通注册 body：{ username, password }；管理员注册页传 options.admin=true，

 * 会附加角色字段（见 apiPaths.authRegisterRoleField，默认 role，并与 userRole 双写以兼容 Spring DTO）。

 * 若响应含 token 与用户信息则与登录相同写入会话；否则仅返回成功（调用方提示去登录）。

 */

export async function register(username, password, options = {}) {

  const roleOpt = options?.role
  const isAdminRegistration =
    options?.admin === true ||
    String(roleOpt ?? '')
      .trim()
      .toLowerCase() === 'admin'

  const json = {
    username: String(username ?? '').trim(),
    password: String(password ?? ''),
  }

  if (isAdminRegistration) {
    const field = apiPaths.authRegisterRoleField
    const value =
      String(apiPaths.authRegisterAdminRoleValue ?? 'admin').trim() || 'admin'
    // 主字段（可配）+ 常见别名全写，避免后端只认 snake_case / camelCase 之一时仍落到默认 user
    json[field] = value
    json.role = value
    json.userRole = value
    json.user_role = value
  } else if (roleOpt != null && String(roleOpt).trim() !== '') {
    json.role = String(roleOpt).trim()
  }

  if (getApiBaseUrl()) {

    const data = await request(apiPaths.authRegister, {

      method: 'POST',

      json,

      skipAuth: true,

    })

    let { token, user } = resolveAuthSessionPayload(data, username)

    if (user && isAdminRegistration) {
      // 后端若仍返回 role=user，前端会话仍按管理员处理（与请求体 role=admin 一致）
      user = { ...user, role: 'admin' }
    }

    if (user) {

      applyBackendSession(token, user)

      return { token, user }

    }

    return { token: null, user: null }

  }



  registerMockUser(username, password, isAdminRegistration ? 'admin' : roleOpt)

  return { token: null, user: null }

}



/** 登出 */

export async function logout() {

  clearMockSession()

  persistToken(null)

  localStorage.removeItem(STORAGE_USER_ID_KEY)

  localStorage.removeItem(STORAGE_USER_JSON_KEY)

}


