import { request } from './request.js'
import { asArray } from '../modules/query/entityBackendSearch.js'
import {
  buildEntityFilterBody,
  entityPrimaryIdKey,
  normalizeDetailRow,
  pickFirstDetailRow,
} from './entityFilterDetail.js'

/** JSON.stringify 会丢掉 undefined 的键，后端收不到字段就不会更新 */
function omitUndefined(obj) {
  const out = {}
  if (!obj || typeof obj !== 'object') return out
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v
  }
  return out
}

/** 与 Apifox 一致：POST /{entity}/filter|upload|update|remove */
const FILTER_PATH = import.meta.env.VITE_ENTITY_FILTER_PATH ?? '/filter'
const UPLOAD_PATH = import.meta.env.VITE_ENTITY_UPLOAD_PATH ?? '/upload'
const UPDATE_PATH = import.meta.env.VITE_ENTITY_UPDATE_PATH ?? '/update'
const REMOVE_PATH = import.meta.env.VITE_ENTITY_REMOVE_PATH ?? '/remove'

/** 列表：POST /{entity}/filter，空条件表示全表（与后端约定一致） */
export async function listEntityRowsAdmin(entity) {
  const path = `/${entity}${FILTER_PATH}`
  const raw = await request(path, { method: 'POST', json: {} })
  return asArray(raw).map((row) => normalizeDetailRow(entity, row) ?? row)
}

/** 新增：POST /{entity}/upload */
export async function uploadEntityRow(entity, payload) {
  const path = `/${entity}${UPLOAD_PATH}`
  const raw = await request(path, { method: 'POST', json: omitUndefined(payload) })
  return pickFirstDetailRow(raw) ?? raw
}

function mergePrimaryKeyForUpdate(entity, id, payload) {
  const idKey = entityPrimaryIdKey(entity)
  const merged = { ...payload }
  if (entity === 'course') {
    const raw = merged[idKey]
    merged[idKey] =
      raw != null && String(raw).trim() !== ''
        ? String(raw).trim()
        : String(id ?? '')
  } else {
    merged[idKey] = Number(id)
  }
  return merged
}

/** 更新：POST /{entity}/update，body 含主键 */
export async function updateEntityRow(entity, id, payload) {
  const path = `/${entity}${UPDATE_PATH}`
  const body = omitUndefined(mergePrimaryKeyForUpdate(entity, id, payload))
  const raw = await request(path, { method: 'POST', json: body })
  return pickFirstDetailRow(raw) ?? raw
}

/** 删除：POST /{entity}/remove */
export async function removeEntityRow(entity, id) {
  const path = `/${entity}${REMOVE_PATH}`
  await request(path, { method: 'POST', json: buildEntityFilterBody(entity, id) })
}
