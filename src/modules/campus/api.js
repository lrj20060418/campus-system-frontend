import { campuses } from '../../mock/data.js'

export function listCampuses() {
  return Promise.resolve([...campuses])
}

export function getCampus(campusId) {
  const id = Number(campusId)
  return Promise.resolve(campuses.find((c) => c.campus_id === id) ?? null)
}
