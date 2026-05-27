import {
  teaches,
  createTeachRow,
  updateTeachRow,
  deleteTeachRow,
} from '../../mock/data.js'
import { getApiBaseUrl } from '../../lib/request.js'
import { fetchEntityDetail, normalizeDetailRow } from '../../lib/entityFilterDetail.js'
import {
  listEntityRowsAdmin,
  uploadEntityRow,
  updateEntityRow,
  removeEntityRow,
} from '../../lib/entityAdminApi.js'
import {
  buildTeachFilterBody,
  formatTeachRouteId,
  parseTeachRouteId,
  teachKeysFromRow,
  teachRowsMatch,
} from '../../lib/teachKeys.js'

const ENTITY = 'teach'

const TEACH_REQUIRED = [
  ['teacher_id', '教师'],
  ['course_id', '课程编号'],
  ['semester', '学期'],
  ['section_no', '班次'],
  ['teach_role', '授课角色'],
  ['start_time', '开始时间'],
  ['end_time', '结束时间'],
]

function normalizeTeachPayload(payload) {
  const p = { ...payload }
  if (p.teacher_id != null && p.teacher_id !== '') {
    p.teacher_id = Number(p.teacher_id)
  }
  if (p.course_id != null) p.course_id = String(p.course_id).trim()
  if (p.semester != null) p.semester = String(p.semester).trim()
  if (p.section_no != null) p.section_no = String(p.section_no).trim()
  if (p.teach_role != null) p.teach_role = String(p.teach_role).trim()
  if (p.start_time != null) p.start_time = String(p.start_time).trim()
  if (p.end_time != null) p.end_time = String(p.end_time).trim()

  for (const [key, label] of TEACH_REQUIRED) {
    const v = p[key]
    if (v == null || v === '' || (typeof v === 'number' && Number.isNaN(v))) {
      throw new Error(`请填写${label}`)
    }
  }
  for (const [key, label] of [
    ['start_time', '开始时间'],
    ['end_time', '结束时间'],
  ]) {
    if (String(p[key]).length < 10) {
      throw new Error(
        `${label}格式不完整，请使用如 2025-09-08 08:00:00`,
      )
    }
  }
  return p
}

export async function listTeaches() {
  if (getApiBaseUrl()) {
    return listEntityRowsAdmin(ENTITY)
  }
  return [...teaches]
}

export async function getTeach(routeId) {
  if (getApiBaseUrl()) {
    const row = await fetchEntityDetail(ENTITY, routeId)
    return normalizeDetailRow(ENTITY, row)
  }
  const keys = parseTeachRouteId(routeId)
  if (!keys) return null
  return teaches.find((t) => teachRowsMatch(t, keys)) ?? null
}

export async function createTeach(payload) {
  const body = normalizeTeachPayload(payload)
  if (getApiBaseUrl()) {
    const row = await uploadEntityRow(ENTITY, body)
    return normalizeDetailRow(ENTITY, row)
  }
  return createTeachRow(body)
}

export async function updateTeach(routeId, payload) {
  const body = normalizeTeachPayload(payload)
  if (getApiBaseUrl()) {
    await updateEntityRow(ENTITY, routeId, body)
    return getTeach(formatTeachRouteId(teachKeysFromRow(body)))
  }
  updateTeachRow(routeId, body)
  return getTeach(formatTeachRouteId(teachKeysFromRow(body)))
}

export async function removeTeach(routeId) {
  if (getApiBaseUrl()) {
    await removeEntityRow(ENTITY, routeId)
    return
  }
  deleteTeachRow(routeId)
}

export { formatTeachRouteId, parseTeachRouteId, buildTeachFilterBody }
