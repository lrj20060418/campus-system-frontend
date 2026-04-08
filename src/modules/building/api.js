import { buildings } from '../../mock/data.js'

export function listBuildings() {
  return Promise.resolve([...buildings])
}

export function getBuilding(buildingId) {
  const id = Number(buildingId)
  return Promise.resolve(buildings.find((b) => b.building_id === id) ?? null)
}
