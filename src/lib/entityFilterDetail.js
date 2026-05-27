import { request } from './request.js'
import {
  buildTeachFilterBody,
  buildTeachRemoveBody,
  formatTeachRouteId,
  parseTeachRouteId,
  teachRowsMatch,
} from './teachKeys.js'

export function formatEntityIdForRequest(entity, rawId) {
  if (entity === 'course' || entity === 'teach') {
    return rawId != null && String(rawId).trim() !== '' ? String(rawId).trim() : ''
  }
  return Number(rawId)
}

/** 后端 POST /course/filter 要求 course_id 为列表 */
export function courseIdAsList(rawId) {
  if (Array.isArray(rawId)) {
    return rawId.map((x) => String(x).trim()).filter((x) => x !== '')
  }
  const s = formatEntityIdForRequest('course', rawId)
  return s ? [s] : []
}

/** 列表/表单用：把后端可能返回的 course_id 列表压成标量字符串 */
export function normalizeCourseIdScalar(raw) {
  if (raw == null) return ''
  if (Array.isArray(raw)) {
    const first = raw.find((x) => x != null && String(x).trim() !== '')
    return first != null ? String(first).trim() : ''
  }
  return String(raw).trim()
}

/**
 * POST /{entity}/filter 的请求体（按 id 查一条；若后端字段名不同，只改此函数）
 */
export function buildEntityFilterBody(entity, rawId) {
  if (entity === 'teach') {
    return buildTeachFilterBody(rawId)
  }
  const id = formatEntityIdForRequest(entity, rawId)
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
      return { course_id: courseIdAsList(rawId) }
    case 'event':
      return { event_id: id }
    default:
      return { id }
  }
}

/**
 * POST /{entity}/remove 请求体（与 filter 可能不同，如 course.remove 要 string 而非 list）
 */
export function buildEntityRemoveBody(entity, rawId) {
  if (entity === 'teach') {
    return buildTeachRemoveBody(rawId)
  }
  if (entity === 'course') {
    const s =
      normalizeCourseIdScalar(rawId) || formatEntityIdForRequest('course', rawId)
    return { course_id: s }
  }
  return buildEntityFilterBody(entity, rawId)
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

function collectDetailRows(data) {
  if (data == null) return []
  if (Array.isArray(data)) {
    return data.filter((r) => r != null && typeof r === 'object')
  }
  if (typeof data === 'object') {
    const arr =
      data.list ?? data.records ?? data.rows ?? data.items ?? null
    if (Array.isArray(arr)) {
      return arr.filter((r) => r != null && typeof r === 'object')
    }
    return [data]
  }
  return []
}

export function readEntityPrimaryId(row, entity) {
  if (entity === 'teach') {
    return formatTeachRouteId(row)
  }
  if (entity === 'course') {
    const scalar = normalizeCourseIdScalar(
      row.course_id ?? row.courseId ?? row.CourseId,
    )
    return scalar || null
  }
  const key = entityPrimaryIdKey(entity)
  if (row[key] != null) return row[key]
  if (row.id != null) return row.id
  const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  if (row[camel] != null) return row[camel]
  return null
}


export function entityIdMatches(row, entity, rawId) {
  if (!row || typeof row !== 'object' || rawId == null || String(rawId).trim() === '') {
    return false
  }
  const got = readEntityPrimaryId(row, entity)
  if (got == null) return false
  if (entity === 'course' || entity === 'teach') {
    if (entity === 'teach') {
      const keys = parseTeachRouteId(rawId)
      return keys ? teachRowsMatch(row, keys) : false
    }
    return String(got).trim() === String(rawId).trim()
  }
  const want = Number(rawId)
  const have = Number(got)
  if (!Number.isNaN(want) && !Number.isNaN(have)) return want === have
  return String(got).trim() === String(rawId).trim()
}

/**
 * 后端 data 可能是：单条对象、或数组、或 { list / records / rows }
 */
export function pickFirstDetailRow(data) {
  const rows = collectDetailRows(data)
  return rows[0] ?? null
}


export function pickDetailRowById(data, entity, rawId) {
  const rows = collectDetailRows(data)
  if (rows.length === 0) return null

  const matched = rows.find((r) => entityIdMatches(r, entity, rawId))
  if (matched) return matched

  if (rows.length === 1 && entityIdMatches(rows[0], entity, rawId)) {
    return rows[0]
  }

  return null
}


const ENTITY_FILTER_PATH =
  import.meta.env.VITE_ENTITY_FILTER_PATH ?? '/filter'

/** POST /{entity}{filterPath} */
export async function fetchEntityDetail(entity, rawId) {
  const path = `/${entity}${ENTITY_FILTER_PATH}`
  const raw = await request(path, {
    method: 'POST',
    json: buildEntityFilterBody(entity, rawId),
  })
  return pickDetailRowById(raw, entity, rawId)
}


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
  if (entity === 'course') {
    const course_id = normalizeCourseIdScalar(
      row.course_id ?? row.courseId ?? row.CourseId,
    )
    return { ...row, course_id }
  }
  return row
}
