import { facilities } from '../../mock/data.js'

export function listFacilities() {
  return Promise.resolve([...facilities])
}

export function getFacility(facilityId) {
  const id = Number(facilityId)
  return Promise.resolve(facilities.find((f) => f.facility_id === id) ?? null)
}
