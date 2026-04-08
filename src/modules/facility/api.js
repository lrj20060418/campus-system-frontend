import {
  facilities,
  createFacilityRow,
  updateFacilityRow,
  deleteFacilityRow,
} from '../../mock/data.js'

export function listFacilities() {
  return Promise.resolve([...facilities])
}

export function getFacility(facilityId) {
  const id = Number(facilityId)
  return Promise.resolve(facilities.find((f) => f.facility_id === id) ?? null)
}

/** POST /api/facilities */
export function createFacility(payload) {
  const row = createFacilityRow(payload)
  return Promise.resolve(row)
}

/** PATCH /api/facilities/:id */
export function updateFacility(id, payload) {
  updateFacilityRow(id, payload)
  return getFacility(id)
}

/** DELETE /api/facilities/:id */
export function removeFacility(id) {
  deleteFacilityRow(id)
  return Promise.resolve()
}
