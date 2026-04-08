import {
  campuses,
  buildings,
  facilities,
  teachers,
  courses,
  events,
  queryRecords,
} from '../../mock/data.js'

/** 读取查询记录（mock：直接返回内存副本） */
export function listQueryRecords() {
  return Promise.resolve([...queryRecords])
}

/** 简单关键词检索：聚合各实体，返回统一结构 */
export function searchAll(keyword) {
  const q = (keyword ?? '').trim().toLowerCase()
  if (!q) {
    return Promise.resolve([])
  }

  const out = []

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

  return Promise.resolve(out)
}
