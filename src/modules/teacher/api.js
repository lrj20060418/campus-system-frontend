import {
  teachers,
  createTeacherRow,
  updateTeacherRow,
  deleteTeacherRow,
} from '../../mock/data.js'

export function listTeachers() {
  return Promise.resolve([...teachers])
}

export function getTeacher(teacherId) {
  const id = Number(teacherId)
  return Promise.resolve(teachers.find((t) => t.teacher_id === id) ?? null)
}

/** POST /api/teachers */
export function createTeacher(payload) {
  const row = createTeacherRow(payload)
  return Promise.resolve(row)
}

/** PATCH /api/teachers/:id */
export function updateTeacher(id, payload) {
  updateTeacherRow(id, payload)
  return getTeacher(id)
}

/** DELETE /api/teachers/:id */
export function removeTeacher(id) {
  deleteTeacherRow(id)
  return Promise.resolve()
}
