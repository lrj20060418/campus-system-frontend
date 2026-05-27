import { getApiBaseUrl, request } from '../../lib/request.js'
import { apiPaths } from '../../config/apiPaths.js'
import { asArray } from './entityBackendSearch.js'
import { pickFirstDetailRow } from '../../lib/entityFilterDetail.js'
import {
  queryRecords,
  appendQueryRecordRow,
  updateQueryRecordRow,
  deleteQueryRecordRow,
  getActiveUserId,
} from '../../mock/data.js'

export function normalizeQueryRecord(row) {
  if (!row || typeof row !== 'object') return row
  return {
    ...row,
    record_id: row.record_id ?? row.id,
    query_time: row.query_time ?? row.create_time,
  }
}

function queryRecordPrimaryId(row) {
  return row?.record_id ?? row?.id
}

/** POST /query_record/search */
export async function searchQueryRecords(body = {}) {
  if (getApiBaseUrl()) {
    const raw = await request(apiPaths.queryRecordSearch, {
      method: 'POST',
      json: body,
    })
    return asArray(raw).map(normalizeQueryRecord)
  }

  let rows = [...queryRecords]
  if (body.user_id != null) {
    const uid = Number(body.user_id)
    rows = rows.filter((r) => r.user_id === uid)
  }
  return rows.map(normalizeQueryRecord)
}

/** 当前用户的自然语言查询记录（仅 natural_language） */
export async function listMyNlQueryRecords() {
  const uid = getActiveUserId()
  if (uid == null) return []

  const rows = await searchQueryRecords({ user_id: uid })
  return rows.filter((r) => r.query_type === 'natural_language')
}

/** POST /query_record/filter */
export async function filterQueryRecord(id) {
  const nid = Number(id)
  if (getApiBaseUrl()) {
    const raw = await request(apiPaths.queryRecordFilter, {
      method: 'POST',
      json: { id: nid },
    })
    return normalizeQueryRecord(pickFirstDetailRow(raw) ?? raw)
  }

  const row = queryRecords.find((r) => queryRecordPrimaryId(r) === nid)
  return normalizeQueryRecord(row ?? null)
}

/** POST /query_record/upload */
export async function uploadQueryRecord(payload) {
  if (getApiBaseUrl()) {
    const raw = await request(apiPaths.queryRecordUpload, {
      method: 'POST',
      json: payload,
    })
    return normalizeQueryRecord(pickFirstDetailRow(raw) ?? raw)
  }

  const uid = payload.user_id ?? getActiveUserId()
  return normalizeQueryRecord(
    appendQueryRecordRow({
      ...payload,
      user_id: uid,
    }),
  )
}

/** POST /query_record/update */
export async function updateQueryRecord(id, payload) {
  const nid = Number(id)
  if (getApiBaseUrl()) {
    const raw = await request(apiPaths.queryRecordUpdate, {
      method: 'POST',
      json: { ...payload, id: nid },
    })
    return normalizeQueryRecord(pickFirstDetailRow(raw) ?? raw)
  }

  const idx = queryRecords.findIndex(
    (r) => queryRecordPrimaryId(r) === nid,
  )
  if (idx === -1) throw new Error('记录不存在')
  return normalizeQueryRecord(updateQueryRecordRow(nid, payload))
}

/** POST /query_record/remove */
export async function removeQueryRecord(id) {
  const nid = Number(id)
  if (getApiBaseUrl()) {
    await request(apiPaths.queryRecordRemove, {
      method: 'POST',
      json: { id: nid },
    })
    return
  }

  deleteQueryRecordRow(nid)
}
