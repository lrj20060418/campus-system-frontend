import {
  campuses,
  buildings,
  facilities,
  teachers,
  courses,
  events,
} from '../../mock/data.js'
import { getApiBaseUrl } from '../../lib/request.js'
import { postEntitySearch, asArray } from './entityBackendSearch.js'

const ENTITY_TYPES = new Set([
  'campus',
  'building',
  'facility',
  'teacher',
  'course',
  'event',
])

function normalizeSearchInput(input) {
  if (typeof input === 'string') {
    return { q: input, entity: 'all' }
  }
  return { q: input?.q, entity: input?.entity ?? 'all' }
}

/**
 * 纯检索：不写查询记录。未配置后端时走 mock；配置后端时只调单一 POST /{entity}/search（需 entity≠all）。
 */
export async function searchAll(input) {
  const opts = normalizeSearchInput(input)
  const rawQ = (opts.q ?? '').trim()
  const entityScope = String(opts.entity ?? 'all').trim() || 'all'

  if (getApiBaseUrl()) {
    if (!rawQ || entityScope === 'all' || !ENTITY_TYPES.has(entityScope)) {
      return []
    }
    return postEntitySearch(entityScope, rawQ)
  }

  return runKeywordSearch(opts)
}

/**
 * 关键词搜索（不写查询记录；记录仅由自然语言查询页维护）。
 */
export async function searchKeywordsWithLog({ q, entity }) {
  const rawQ = (q ?? '').trim()
  if (!rawQ) {
    return []
  }

  const entityScope = String(entity ?? 'all').trim() || 'all'

  if (getApiBaseUrl()) {
    if (entityScope === 'all' || !ENTITY_TYPES.has(entityScope)) {
      return []
    }
    return postEntitySearch(entityScope, rawQ)
  }

  return runKeywordSearch({ q: rawQ, entity })
}

/**
 * 同步执行关键词检索，返回统一列表项结构。
 * @param {{ q: string, entity?: string }} opts - q 已 trim 的原始字符串（内部再 toLowerCase 匹配）
 */
function runKeywordSearch(opts) {
  const rawQ = (opts.q ?? '').trim()
  const q = rawQ.toLowerCase()
  const entityRaw = String(opts.entity ?? 'all').trim()
  const entityFilter =
    entityRaw && entityRaw !== 'all' && ENTITY_TYPES.has(entityRaw)
      ? entityRaw
      : null

  if (!q) {
    return []
  }

  const out = []

  if (!entityFilter || entityFilter === 'campus') {
    for (const c of campuses) {
      if (
        String(c.campus_name).toLowerCase().includes(q) ||
        String(c.address ?? '').toLowerCase().includes(q)
      ) {
        out.push({
          entity: 'campus',
          id: c.campus_id,
          title: c.campus_name,
          subtitle: c.address,
        })
      }
    }
  }
  if (!entityFilter || entityFilter === 'building') {
    for (const b of buildings) {
      if (
        String(b.building_name).toLowerCase().includes(q) ||
        String(b.building_type).toLowerCase().includes(q)
      ) {
        out.push({
          entity: 'building',
          id: b.building_id,
          title: b.building_name,
          subtitle: b.building_type,
        })
      }
    }
  }
  if (!entityFilter || entityFilter === 'facility') {
    for (const f of facilities) {
      if (
        String(f.facility_name).toLowerCase().includes(q) ||
        String(f.facility_type).toLowerCase().includes(q)
      ) {
        out.push({
          entity: 'facility',
          id: f.facility_id,
          title: f.facility_name,
          subtitle: f.facility_type,
        })
      }
    }
  }
  if (!entityFilter || entityFilter === 'teacher') {
    for (const t of teachers) {
      if (
        String(t.teacher_name).toLowerCase().includes(q) ||
        String(t.department ?? '').toLowerCase().includes(q)
      ) {
        out.push({
          entity: 'teacher',
          id: t.teacher_id,
          title: t.teacher_name,
          subtitle: t.department,
        })
      }
    }
  }
  if (!entityFilter || entityFilter === 'course') {
    for (const c of courses) {
      if (
        String(c.course_name).toLowerCase().includes(q) ||
        String(c.offering_department ?? '').toLowerCase().includes(q)
      ) {
        out.push({
          entity: 'course',
          id: c.course_id,
          title: c.course_name,
          subtitle: c.offering_department,
        })
      }
    }
  }
  if (!entityFilter || entityFilter === 'event') {
    for (const e of events) {
      if (
        String(e.event_name).toLowerCase().includes(q) ||
        String(e.organizer ?? '').toLowerCase().includes(q)
      ) {
        out.push({
          entity: 'event',
          id: e.event_id,
          title: e.event_name,
          subtitle: e.start_time,
        })
      }
    }
  }

  return out
}
