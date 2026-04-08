import {
  courses,
  createCourseRow,
  updateCourseRow,
  deleteCourseRow,
} from '../../mock/data.js'

export function listCourses() {
  return Promise.resolve([...courses])
}

export function getCourse(courseId) {
  const id = Number(courseId)
  return Promise.resolve(courses.find((c) => c.course_id === id) ?? null)
}

/** POST /api/courses */
export function createCourse(payload) {
  const row = createCourseRow(payload)
  return Promise.resolve(row)
}

/** PATCH /api/courses/:id */
export function updateCourse(id, payload) {
  updateCourseRow(id, payload)
  return getCourse(id)
}

/** DELETE /api/courses/:id */
export function removeCourse(id) {
  deleteCourseRow(id)
  return Promise.resolve()
}
