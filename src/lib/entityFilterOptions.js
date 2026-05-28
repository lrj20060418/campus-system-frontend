import { listCampuses } from '../modules/campus/api.js'
import { listBuildings } from '../modules/building/api.js'
import { listFacilities } from '../modules/facility/api.js'
import { listTeachers } from '../modules/teacher/api.js'
import { listCourses } from '../modules/course/api.js'
import { listEvents } from '../modules/event/api.js'
import { listTeaches } from '../modules/teach/api.js'

function sortOptions(options) {
  return [...options].sort((a, b) =>
    String(a.label).localeCompare(String(b.label), 'zh-CN'),
  )
}

function uniqueFieldOptions(rows, field) {
  const seen = new Set()
  const out = []
  for (const row of rows) {
    const v = row[field]
    if (v == null || String(v).trim() === '') continue
    const key = String(v)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ value: v, label: key })
  }
  return sortOptions(out)
}

function idLabelOptions(rows, idField, labelFn, { valueType = 'number' } = {}) {
  const seen = new Set()
  const out = []
  for (const row of rows) {
    const raw = row[idField]
    const value =
      valueType === 'string' ? String(raw ?? '').trim() : Number(raw)
    if (valueType === 'number' && Number.isNaN(value)) continue
    if (valueType === 'string' && !value) continue

    const key = valueType === 'number' ? `n:${value}` : `s:${value}`
    if (seen.has(key)) continue
    seen.add(key)

    out.push({
      value: Number.isNaN(value) ? raw : value,
      label: labelFn(row),
    })
  }
  return sortOptions(out)
}

/**
 * 高级筛选：为 idList / tagList 下拉提供候选项（POST /{entity}/filter 空 body 拉全表）
 * @returns {Promise<Record<string, { value: string|number, label: string }[]>>}
 */
export async function loadFilterFieldOptions(entity) {
  switch (entity) {
    case 'campus': {
      const rows = await listCampuses()
      return {
        campus_id: idLabelOptions(rows, 'campus_id', (r) => `${r.campus_name}（${r.campus_id}）`),
        campus_name: uniqueFieldOptions(rows, 'campus_name'),
      }
    }
    case 'building': {
      const [buildings, campuses] = await Promise.all([listBuildings(), listCampuses()])
      return {
        building_id: idLabelOptions(
          buildings,
          'building_id',
          (r) => `${r.building_name}（${r.building_id}）`,
        ),
        campus_id: idLabelOptions(campuses, 'campus_id', (r) => `${r.campus_name}（${r.campus_id}）`),
        building_name: uniqueFieldOptions(buildings, 'building_name'),
        building_type: uniqueFieldOptions(buildings, 'building_type'),
      }
    }
    case 'facility': {
      const [facilities, buildings] = await Promise.all([listFacilities(), listBuildings()])
      return {
        facility_id: idLabelOptions(
          facilities,
          'facility_id',
          (r) => `${r.facility_name}（${r.facility_id}）`,
        ),
        building_id: idLabelOptions(
          buildings,
          'building_id',
          (r) => `${r.building_name}（${r.building_id}）`,
        ),
        facility_name: uniqueFieldOptions(facilities, 'facility_name'),
        facility_type: uniqueFieldOptions(facilities, 'facility_type'),
      }
    }
    case 'teacher': {
      const rows = await listTeachers()
      return {
        teacher_id: idLabelOptions(
          rows,
          'teacher_id',
          (r) => `${r.teacher_name || '教师'}（${r.teacher_id}）`,
        ),
        teacher_name: uniqueFieldOptions(rows, 'teacher_name'),
        department: uniqueFieldOptions(rows, 'department'),
        email: uniqueFieldOptions(rows, 'email').filter((o) => o.label),
      }
    }
    case 'course': {
      const [courses, teaches] = await Promise.all([listCourses(), listTeaches()])
      return {
        course_id: idLabelOptions(
          courses,
          'course_id',
          (r) => `${r.course_name}（${r.course_id}）`,
          { valueType: 'string' },
        ),
        course_name: uniqueFieldOptions(courses, 'course_name'),
        offering_department: uniqueFieldOptions(courses, 'offering_department'),
        semester: uniqueFieldOptions(teaches, 'semester'),
      }
    }
    case 'event': {
      const [events, buildings] = await Promise.all([listEvents(), listBuildings()])
      return {
        event_id: idLabelOptions(events, 'event_id', (r) => `${r.event_name}（${r.event_id}）`),
        building_id: idLabelOptions(
          buildings,
          'building_id',
          (r) => `${r.building_name}（${r.building_id}）`,
        ),
        event_name: uniqueFieldOptions(events, 'event_name'),
        organizer: uniqueFieldOptions(events, 'organizer'),
      }
    }
    case 'teach': {
      const [teaches, teachers, courses] = await Promise.all([
        listTeaches(),
        listTeachers(),
        listCourses(),
      ])
      return {
        teacher_id: idLabelOptions(
          teachers,
          'teacher_id',
          (r) => `${r.teacher_name || '教师'}（${r.teacher_id}）`,
        ),
        course_id: idLabelOptions(
          courses,
          'course_id',
          (r) => `${r.course_name}（${r.course_id}）`,
          { valueType: 'string' },
        ),
        teacher_name: uniqueFieldOptions(teachers, 'teacher_name'),
        course_name: uniqueFieldOptions(courses, 'course_name'),
        semester: uniqueFieldOptions(teaches, 'semester'),
        section_no: uniqueFieldOptions(teaches, 'section_no'),
      }
    }
    default:
      return {}
  }
}
