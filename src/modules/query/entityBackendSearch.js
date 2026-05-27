import { request } from '../../lib/request.js'
import { buildEntitySearchBody } from '../../config/apiPaths.js'
import { normalizeCourseIdScalar } from '../../lib/entityFilterDetail.js'
import { formatTeachRouteId, buildTeachHomeFilterBody } from '../../lib/teachKeys.js'

const ENTITY_FILTER_PATH =
  import.meta.env.VITE_ENTITY_FILTER_PATH ?? '/filter'

/** 把后端一行映射成前端搜索/筛选列表项 */
export function mapEntityRowToListItem(entity, row) {
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
    case 'course': {
      const courseId = normalizeCourseIdScalar(
        row.course_id ?? row.courseId,
      )
      return {
        entity: 'course',
        id: courseId || row.course_id,
        title: row.course_name,
        subtitle: row.offering_department,
      }
    }
    case 'event':
      return {
        entity: 'event',
        id: row.event_id,
        title: row.event_name,
        subtitle: row.organizer ?? row.start_time,
      }
    case 'teach': {
      const id = formatTeachRouteId(row)
      if (!id || id.includes('NaN')) return null
      const titleParts = [
        row.course_name || row.course_id,
        row.semester,
        row.section_no != null && String(row.section_no).trim() !== ''
          ? `班${row.section_no}`
          : null,
      ].filter(Boolean)
      const subtitleParts = [row.teacher_name, row.teach_role].filter(
        (x) => x != null && String(x).trim() !== '',
      )
      return {
        entity: 'teach',
        id,
        title: titleParts.join(' · ') || '授课记录',
        subtitle: subtitleParts.join(' · '),
      }
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
  return rows
    .map((r) => mapEntityRowToListItem(entity, r))
    .filter((item) => item && item.id != null && String(item.id).trim() !== '')
}

/** 授课首页搜索：POST /teach/filter，body 含 teacher_name / course_name / semester */
export async function postTeachFilterSearch(keyword, field) {
  const path = `/teach${ENTITY_FILTER_PATH}`
  const raw = await request(path, {
    method: 'POST',
    json: buildTeachHomeFilterBody(keyword, field),
  })
  const rows = asArray(raw)
  return rows
    .map((r) => mapEntityRowToListItem('teach', r))
    .filter((item) => item && item.id != null && String(item.id).trim() !== '')
}
