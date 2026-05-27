import {
  campuses,
  createCampusRow,
  updateCampusRow,
  deleteCampusRow,
} from '../../mock/data.js'
import { getApiBaseUrl } from '../../lib/request.js'
import {
  fetchEntityDetail,
  normalizeDetailRow,
} from '../../lib/entityFilterDetail.js'
import {
  listEntityRowsAdmin,
  uploadEntityRow,
  updateEntityRow,
  removeEntityRow,
} from '../../lib/entityAdminApi.js'

const ENTITY = 'campus'

/** 后端 DTO 使用 campus_address；前端表单仍用 address */
function mapCampusPayloadForBackend(payload) {
  if (!payload || typeof payload !== 'object') return payload
  const { address, campus_address, ...rest } = payload
  const addr = campus_address ?? address
  const out = { ...rest }
  if (addr !== undefined) {
    out.campus_address = String(addr ?? '')
  }
  return out
}

export async function listCampuses() {
  if (getApiBaseUrl()) {
    return listEntityRowsAdmin(ENTITY)
  }
  return [...campuses]
}

export async function getCampus(campusId) {
  if (getApiBaseUrl()) {
    const row = await fetchEntityDetail(ENTITY, campusId)
    return normalizeDetailRow(ENTITY, row)
  }
  const id = Number(campusId)
  return campuses.find((c) => c.campus_id === id) ?? null
}

export async function createCampus(payload) {
  if (getApiBaseUrl()) {
    const row = await uploadEntityRow(ENTITY, mapCampusPayloadForBackend(payload))
    return normalizeDetailRow(ENTITY, row)
  }
  return createCampusRow(payload)
}

export async function updateCampus(id, payload) {
  if (getApiBaseUrl()) {
    await updateEntityRow(ENTITY, id, mapCampusPayloadForBackend(payload))
    return getCampus(id)
  }
  updateCampusRow(id, payload)
  return getCampus(id)
}

export async function removeCampus(id) {
  if (getApiBaseUrl()) {
    await removeEntityRow(ENTITY, id)
    return
  }
  deleteCampusRow(id)
}
