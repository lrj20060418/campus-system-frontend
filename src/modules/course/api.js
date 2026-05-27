import {
  courses,
  createCourseRow,
  updateCourseRow,
  deleteCourseRow,
} from '../../mock/data.js'
import { getApiBaseUrl } from '../../lib/request.js'
import { fetchEntityDetail, normalizeDetailRow } from '../../lib/entityFilterDetail.js'
import {
  listEntityRowsAdmin,
  uploadEntityRow,
  updateEntityRow,
  removeEntityRow,
} from '../../lib/entityAdminApi.js'

const ENTITY = 'course'

function normalizeCreditPayload(payload) {
  const p = { ...payload }
  if (Object.prototype.hasOwnProperty.call(p, 'credit')) {
    const creditRaw = p.credit
    p.credit =
      creditRaw === '' || creditRaw === null || creditRaw === undefined
        ? null
        : Number(creditRaw)
  }
  return p
}

export async function listCourses() {
  if (getApiBaseUrl()) {
    return listEntityRowsAdmin(ENTITY)
  }
  return [...courses]
}

export async function getCourse(courseId) {
  if (getApiBaseUrl()) {
    const row = await fetchEntityDetail(ENTITY, courseId)
    return normalizeDetailRow(ENTITY, row)
  }
  const id = Number(courseId)
  return courses.find((c) => c.course_id === id) ?? null
}

export async function createCourse(payload) {
  if (getApiBaseUrl()) {
    // 后端 course_id 为 string；新建用空字符串占位（勿用 null，否则 422）
    const rawId = payload.course_id
    const courseIdStr =
      rawId != null && String(rawId).trim() !== '' ? String(rawId).trim() : ''
    const body = normalizeCreditPayload({
      course_id: courseIdStr,
      course_name: String(payload.course_name ?? '').trim(),
      offering_department: String(payload.offering_department ?? '').trim(),
      semester: String(payload.semester ?? '').trim(),
      credit: payload.credit,
    })
    const row = await uploadEntityRow(ENTITY, body)
    return normalizeDetailRow(ENTITY, row)
  }
  return createCourseRow(payload)
}

export async function updateCourse(id, payload) {
  const body = normalizeCreditPayload(payload)
  if (body.course_id != null && String(body.course_id).trim() !== '') {
    body.course_id = String(body.course_id).trim()
  }
  if (getApiBaseUrl()) {
    const nextId = body.course_id ?? id
    await updateEntityRow(ENTITY, id, body)
    return getCourse(nextId)
  }
  updateCourseRow(id, body)
  return getCourse(body.course_id ?? id)
}

export async function removeCourse(id) {
  if (getApiBaseUrl()) {
    await removeEntityRow(ENTITY, id)
    return
  }
  deleteCourseRow(id)
}
