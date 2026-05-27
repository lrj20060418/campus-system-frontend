import { request } from './request.js'

/**
 * POST /{entity}/filter 的请求体（按 id 查一条；若后端字段名不同，只改此函数）
 */
export function buildEntityFilterBody(entity, rawId) {
  const id = Number(rawId)
  switch (entity) {
    case 'campus':
      return { campus_id: id }
    case 'building':
      return { building_id: id }
    case 'facility':
      return { facility_id: id }
    case 'teacher':
      return { teacher_id: id }
    case 'course':
      return { course_id: id }
    case 'event':
      return { event_id: id }
    default:
      return { id }
  }
}

/** 主键字段名，供管理端 POST /{entity}/update 拼 body */
export function entityPrimaryIdKey(entity) {
  switch (entity) {
    case 'campus':
      return 'campus_id'
    case 'building':
      return 'building_id'
    case 'facility':
      return 'facility_id'
    case 'teacher':
      return 'teacher_id'
    case 'course':
      return 'course_id'
    case 'event':
      return 'event_id'
    default:
      return 'id'
  }
}

/**
 * 后端 data 可能是：单条对象、或数组、或 { list / records / rows }
 */
export function pickFirstDetailRow(data) {
  if (data == null) return null
  if (Array.isArray(data)) return data[0] ?? null
  if (typeof data === 'object') {
    const arr =
      data.list ?? data.records ?? data.rows ?? data.items ?? null
    if (Array.isArray(arr)) return arr[0] ?? null
    return data
  }
  return null
}

/** 与 Apifox 一致，默认 POST /campus/filter；若为大写 /Filter 可设 VITE_ENTITY_FILTER_PATH=/Filter */
const ENTITY_FILTER_PATH =
  import.meta.env.VITE_ENTITY_FILTER_PATH ?? '/filter'

/** 统一走 POST /{entity}{filterPath}，返回解包后第一条（或对象本身） */
export async function fetchEntityDetail(entity, rawId) {
  const path = `/${entity}${ENTITY_FILTER_PATH}`
  const raw = await request(path, {
    method: 'POST',
    json: buildEntityFilterBody(entity, rawId),
  })
  return pickFirstDetailRow(raw)
}

/** 兼容字段拼写 / 驼峰，供详情展示用 */
export function normalizeDetailRow(entity, row) {
  if (!row || typeof row !== 'object') return row
  if (entity === 'campus') {
    const address =
      row.address ??
      row.campus_address ??
      row.adrress ??
      row.Address ??
      ''
    return { ...row, address }
  }
  if (entity === 'facility') {
    const open_time = row.open_time ?? row.openTime ?? ''
    return { ...row, open_time, openTime: row.openTime ?? open_time }
  }
  return row
}
