import {
  campuses,
  buildings,
  facilities,
  teachers,
  courses,
  events,
  queryRecords,
  appendQueryRecordRow,
  MOCK_CURRENT_USER_ID,
} from '../../mock/data.js'

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
 * 纯检索：不写入查询记录。兼容 searchAll('关键词') 与 searchAll({ q, entity })。
 */
export function searchAll(input) {
  const opts = normalizeSearchInput(input)
  return Promise.resolve(runKeywordSearch(opts))
}

/**
 * 关键词搜索并写入 QueryRecord（与后端「搜索即落库」对齐；mock 在本地插入一条记录）。
 * 空关键词不写记录、不检索。
 */
export function searchKeywordsWithLog({ q, entity }) {
  const rawQ = (q ?? '').trim()
  if (!rawQ) {
    return Promise.resolve([])
  }

  const out = runKeywordSearch({ q: rawQ, entity })

  appendQueryRecordRow({
    user_id: MOCK_CURRENT_USER_ID,
    query_text: rawQ,
    query_type: 'keyword',
    status: 'success',
    result_count: out.length,
  })

  return Promise.resolve(out)
}

/** 读取查询记录（mock：直接返回内存副本；后端：GET /api/me/query-records） */
export function listQueryRecords() {
  return Promise.resolve([...queryRecords])
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
