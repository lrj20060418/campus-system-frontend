import {
  buildings,
  createBuildingRow,
  updateBuildingRow,
  deleteBuildingRow,
} from '../../mock/data.js'

export function listBuildings() {
  return Promise.resolve([...buildings])
}

export function getBuilding(buildingId) {
  const id = Number(buildingId)
  return Promise.resolve(buildings.find((b) => b.building_id === id) ?? null)
}

/** POST /api/buildings */
export function createBuilding(payload) {
  const row = createBuildingRow(payload)
  return Promise.resolve(row)
}

/** PATCH /api/buildings/:id */
export function updateBuilding(id, payload) {
  updateBuildingRow(id, payload)
  return getBuilding(id)
}

/** DELETE /api/buildings/:id */
export function removeBuilding(id) {
  deleteBuildingRow(id)
  return Promise.resolve()
}
