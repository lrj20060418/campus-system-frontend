import { getApiBaseUrl, request } from '../../lib/request.js'
import { apiPaths } from '../../config/apiPaths.js'
import { getActiveUserId, appendQueryRecordRow } from '../../mock/data.js'
import { normalizeQueryRecord } from './queryRecordApi.js'

/**
 * 自然语言查询：POST /search { query, user_id }
 * 后端写入 query_record 并在 data 中返回 answer、raw_results、query_record。
 */
export async function naturalLanguageQuery(queryText) {
  const q = String(queryText ?? '').trim()
  if (!q) {
    throw new Error('请输入问题')
  }

  const uid = getActiveUserId()
  if (uid == null) {
    throw new Error('请先登录后再使用自然语言查询')
  }

  if (getApiBaseUrl()) {
    const data = await request(apiPaths.nlSearch, {
      method: 'POST',
      json: { query: q, user_id: uid },
    })
    return {
      answer: data?.answer ?? '',
      raw_results: data?.raw_results ?? [],
      query_record: normalizeQueryRecord(data?.query_record),
    }
  }

  const answer = `（mock）关于「${q}」：邯郸校区的教学楼包括光华楼、理科楼、文科楼。`
  const query_record = appendQueryRecordRow({
    user_id: uid,
    query_text: q,
    query_type: 'natural_language',
    status: 'success',
    answer,
  })
  return {
    answer,
    raw_results: [],
    query_record: normalizeQueryRecord(query_record),
  }
}
