import {
  buildings,
  createBuildingRow,
  updateBuildingRow,
  deleteBuildingRow,
} from '../../mock/data.js'
import { getApiBaseUrl } from '../../lib/request.js'
import { fetchEntityDetail, normalizeDetailRow } from '../../lib/entityFilterDetail.js'
import {
  listEntityRowsAdmin,
  uploadEntityRow,
  updateEntityRow,
  removeEntityRow,
} from '../../lib/entityAdminApi.js'
import { getCampus } from '../campus/api.js'

const ENTITY = 'building'

/** 后端 DTO 要求 body 含 campus_name，根据 campus_id 补全 */
async function withCampusNameForBackend(payload) {
  const out = {
    ...payload,
    campus_id: Number(payload.campus_id),
  }
  const campus = await getCampus(out.campus_id)
  const name = campus?.campus_name != null ? String(campus.campus_name).trim() : ''
  if (!name) {
    throw new Error('无法获取校区名称，请确认已选择有效校区')
  }
  out.campus_name = name
  return out
}

export async function listBuildings() {
  if (getApiBaseUrl()) {
    return listEntityRowsAdmin(ENTITY)
  }
  return [...buildings]
}

export async function getBuilding(buildingId) {
  if (getApiBaseUrl()) {
    const row = await fetchEntityDetail(ENTITY, buildingId)
    return normalizeDetailRow(ENTITY, row)
  }
  const id = Number(buildingId)
  return buildings.find((b) => b.building_id === id) ?? null
}

export async function createBuilding(payload) {
  if (getApiBaseUrl()) {
    const body = await withCampusNameForBackend(payload)
    const row = await uploadEntityRow(ENTITY, body)
    return normalizeDetailRow(ENTITY, row)
  }
  return createBuildingRow(payload)
}

export async function updateBuilding(id, payload) {
  if (getApiBaseUrl()) {
    const body = await withCampusNameForBackend(payload)
    await updateEntityRow(ENTITY, id, body)
    return getBuilding(id)
  }
  updateBuildingRow(id, payload)
  return getBuilding(id)
}

export async function removeBuilding(id) {
  if (getApiBaseUrl()) {
    await removeEntityRow(ENTITY, id)
    return
  }
  deleteBuildingRow(id)
}
