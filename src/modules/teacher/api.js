import {
  teachers,
  createTeacherRow,
  updateTeacherRow,
  deleteTeacherRow,
} from '../../mock/data.js'
import { getApiBaseUrl } from '../../lib/request.js'
import { fetchEntityDetail, normalizeDetailRow } from '../../lib/entityFilterDetail.js'
import {
  listEntityRowsAdmin,
  uploadEntityRow,
  updateEntityRow,
  removeEntityRow,
} from '../../lib/entityAdminApi.js'

const ENTITY = 'teacher'

export async function listTeachers() {
  if (getApiBaseUrl()) {
    return listEntityRowsAdmin(ENTITY)
  }
  return [...teachers]
}

export async function getTeacher(teacherId) {
  if (getApiBaseUrl()) {
    const row = await fetchEntityDetail(ENTITY, teacherId)
    return normalizeDetailRow(ENTITY, row)
  }
  const id = Number(teacherId)
  return teachers.find((t) => t.teacher_id === id) ?? null
}

export async function createTeacher(payload) {
  if (getApiBaseUrl()) {
    const row = await uploadEntityRow(ENTITY, { ...payload })
    return normalizeDetailRow(ENTITY, row)
  }
  return createTeacherRow(payload)
}

export async function updateTeacher(id, payload) {
  if (getApiBaseUrl()) {
    await updateEntityRow(ENTITY, id, payload)
    return getTeacher(id)
  }
  updateTeacherRow(id, payload)
  return getTeacher(id)
}

export async function removeTeacher(id) {
  if (getApiBaseUrl()) {
    await removeEntityRow(ENTITY, id)
    return
  }
  deleteTeacherRow(id)
}
