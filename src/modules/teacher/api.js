import { teachers } from '../../mock/data.js'

export function listTeachers() {
  return Promise.resolve([...teachers])
}

export function getTeacher(teacherId) {
  const id = Number(teacherId)
  return Promise.resolve(teachers.find((t) => t.teacher_id === id) ?? null)
}
