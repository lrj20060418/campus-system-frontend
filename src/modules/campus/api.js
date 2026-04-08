import {
  campuses,
  createCampusRow,
  updateCampusRow,
  deleteCampusRow,
} from '../../mock/data.js'

export function listCampuses() {
  return Promise.resolve([...campuses])
}

export function getCampus(campusId) {
  const id = Number(campusId)
  return Promise.resolve(campuses.find((c) => c.campus_id === id) ?? null)
}

/** POST /api/campuses */
export function createCampus(payload) {
  const row = createCampusRow(payload)
  return Promise.resolve(row)
}

/** PATCH /api/campuses/:id */
export function updateCampus(id, payload) {
  updateCampusRow(id, payload)
  return getCampus(id)
}

/** DELETE /api/campuses/:id */
export function removeCampus(id) {
  deleteCampusRow(id)
  return Promise.resolve()
}
