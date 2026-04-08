import { courses } from '../../mock/data.js'

export function listCourses() {
  return Promise.resolve([...courses])
}

export function getCourse(courseId) {
  const id = Number(courseId)
  return Promise.resolve(courses.find((c) => c.course_id === id) ?? null)
}
