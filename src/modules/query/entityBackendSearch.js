import { request } from '../../lib/request.js'
import { buildEntitySearchBody } from '../../config/apiPaths.js'

/** 把后端一行映射成前端搜索列表项（与 mock runKeywordSearch 输出一致） */
function mapRow(entity, row) {
  if (!row || typeof row !== 'object') return null
  switch (entity) {
    case 'campus':
      return {
        entity: 'campus',
        id: row.campus_id,
        title: row.campus_name,
        subtitle: row.address,
      }
    case 'building':
      return {
        entity: 'building',
        id: row.building_id,
        title: row.building_name,
        subtitle: row.building_type,
      }
    case 'facility':
      return {
        entity: 'facility',
        id: row.facility_id,
        title: row.facility_name,
        subtitle: row.facility_type,
      }
    case 'teacher':
      return {
        entity: 'teacher',
        id: row.teacher_id,
        title: row.teacher_name,
        subtitle: row.department,
      }
    case 'course':
      return {
        entity: 'course',
        id: row.course_id,
        title: row.course_name,
        subtitle: row.offering_department,
      }
    case 'event':
      return {
        entity: 'event',
        id: row.event_id,
        title: row.event_name,
        subtitle: row.organizer ?? row.start_time,
      }
    default:
      return null
  }
}

export function asArray(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    return (
      data.list ??
      data.records ??
      data.rows ??
      data.items ??
      data.data ??
      []
    )
  }
  return []
}

/**
 * 单个资源：POST /{entity}/search
 * 请求体由 buildEntitySearchBody(entity, keyword) 生成（如 campus → { campus_name }）
 */
export async function postEntitySearch(entity, keyword) {
  const path = `/${entity}/search`
  const raw = await request(path, {
    method: 'POST',
    json: buildEntitySearchBody(entity, keyword),
  })
  const rows = asArray(raw)
  return rows.map((r) => mapRow(entity, r)).filter(Boolean)
}
