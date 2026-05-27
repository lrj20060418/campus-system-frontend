import {
  events,
  createEventRow,
  updateEventRow,
  deleteEventRow,
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

const ENTITY = 'event'

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
  return out
}

export async function listEvents() {
  if (getApiBaseUrl()) {
    return listEntityRowsAdmin(ENTITY)
  }
  return [...events]
}

export async function getEvent(eventId) {
  if (getApiBaseUrl()) {
    const row = await fetchEntityDetail(ENTITY, eventId)
    return normalizeDetailRow(ENTITY, row)
  }
  const id = Number(eventId)
  return events.find((e) => e.event_id === id) ?? null
}

export async function createEvent(payload) {
  if (getApiBaseUrl()) {
    const body = await withBuildingNameForBackend(payload)
    const row = await uploadEntityRow(ENTITY, body)
    return normalizeDetailRow(ENTITY, row)
  }
  return createEventRow(payload)
}

export async function updateEvent(id, payload) {
  if (getApiBaseUrl()) {
    const body = await withBuildingNameForBackend(payload)
    await updateEntityRow(ENTITY, id, body)
    return getEvent(id)
  }
  updateEventRow(id, payload)
  return getEvent(id)
}

export async function removeEvent(id) {
  if (getApiBaseUrl()) {
    await removeEntityRow(ENTITY, id)
    return
  }
  deleteEventRow(id)
}
