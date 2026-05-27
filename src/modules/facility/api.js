import {
  facilities,
  createFacilityRow,
  updateFacilityRow,
  deleteFacilityRow,
} from '../../mock/data.js'
import { getApiBaseUrl } from '../../lib/request.js'
import { fetchEntityDetail, normalizeDetailRow } from '../../lib/entityFilterDetail.js'
import {
  listEntityRowsAdmin,
  uploadEntityRow,
  updateEntityRow,
  removeEntityRow,
} from '../../lib/entityAdminApi.js'
import { getBuilding } from '../building/api.js'

const ENTITY = 'facility'

/** 后端 DTO 要求 body 含 building_name，根据 building_id 补全 */
async function withBuildingNameForBackend(payload) {
  const out = {
    ...payload,
    building_id: Number(payload.building_id),
  }
  const building = await getBuilding(out.building_id)
  const name =
    building?.building_name != null ? String(building.building_name).trim() : ''
  if (!name) {
    throw new Error('无法获取建筑名称，请确认已选择有效建筑')
  }
  out.building_name = name
  // 部分后端 JSON 只认 camelCase；双写避免只更新 openTime 或只认 open_time
  const ot = out.open_time != null ? String(out.open_time) : ''
  out.open_time = ot
  out.openTime = ot
  return out
}

export async function listFacilities() {
  if (getApiBaseUrl()) {
    return listEntityRowsAdmin(ENTITY)
  }
  return [...facilities]
}

export async function getFacility(facilityId) {
  if (getApiBaseUrl()) {
    const row = await fetchEntityDetail(ENTITY, facilityId)
    return normalizeDetailRow(ENTITY, row)
  }
  const id = Number(facilityId)
  return facilities.find((f) => f.facility_id === id) ?? null
}

export async function createFacility(payload) {
  if (getApiBaseUrl()) {
    const body = await withBuildingNameForBackend(payload)
    const row = await uploadEntityRow(ENTITY, body)
    return normalizeDetailRow(ENTITY, row)
  }
  return createFacilityRow(payload)
}

export async function updateFacility(id, payload) {
  if (getApiBaseUrl()) {
    const body = await withBuildingNameForBackend(payload)
    await updateEntityRow(ENTITY, id, body)
    return getFacility(id)
  }
  updateFacilityRow(id, payload)
  return getFacility(id)
}

export async function removeFacility(id) {
  if (getApiBaseUrl()) {
    await removeEntityRow(ENTITY, id)
    return
  }
  deleteFacilityRow(id)
}
