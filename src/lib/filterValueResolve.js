/**
 * 筛选表单值 → 后端 filter 请求体：统一解析 label/括号/空格，避免 course_id 等被拆碎
 */

export function normalizeDisplayText(s) {
  return String(s ?? '')
    .replace(/\uFF08/g, '(')
    .replace(/\uFF09/g, ')')
    .replace(/\s+/g, ' ')
    .trim()
}

function labelsMatch(a, b) {
  return normalizeDisplayText(a) === normalizeDisplayText(b)
}

/** 从「名称（ID）」或「名称 (ID)」中提取尾部 ID */
export function extractTrailingIdFromLabel(str) {
  const n = normalizeDisplayText(str)
  const m = n.match(/[(]\s*([^)]+?)\s*[)]\s*$/i)
  return m ? m[1].trim() : null
}

export function isFilterIdFieldName(fieldName) {
  return fieldName === 'course_id' || fieldName.endsWith('_id')
}

/**
 * 将表单项 raw 转为后端可用的标量（id / 文本）
 * @param {unknown} raw
 * @param {{ value: unknown, label: string }[]} [options]
 * @param {{ type?: string, name?: string, valueType?: string }} field
 */
export function resolveOneFilterValue(raw, options, field) {
  if (raw == null || raw === '') return raw

  const str = normalizeDisplayText(raw)
  if (!str) return raw

  if (options?.length) {
    for (const o of options) {
      if (o.value === raw) return o.value
      if (String(o.value) === str) return o.value
      if (
        field.valueType === 'number' &&
        !Number.isNaN(Number(o.value)) &&
        Number(o.value) === Number(raw)
      ) {
        return o.value
      }
      if (labelsMatch(o.label, str)) return o.value
    }
  }

  const isIdField =
    field.type === 'idList' || (field.name && isFilterIdFieldName(field.name))

  if (isIdField) {
    const tail = extractTrailingIdFromLabel(str)
    if (tail) {
      if (field.valueType === 'number') {
        const n = Number(tail)
        return Number.isNaN(n) ? tail : n
      }
      return tail
    }
    if (field.valueType === 'number' && /^\d+$/.test(str)) {
      return Number(str)
    }
    return str
  }

  return raw
}

/**
 * @param {unknown} raw
 * @param {'number'|'string'} valueType
 * @param {{ type?: string }} [field]
 */
export function parseToFilterList(raw, valueType, field) {
  const isIdList = field?.type === 'idList'
  let arr = []

  if (Array.isArray(raw)) {
    arr = raw
  } else if (typeof raw === 'string') {
    const pattern = isIdList ? /[,，]+/ : /[,，\s]+/
    arr = raw.split(pattern).map((s) => s.trim()).filter(Boolean)
  } else if (raw != null && raw !== '') {
    arr = [raw]
  }

  if (!arr.length) return undefined

  if (valueType === 'number') {
    const nums = arr.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
    return nums.length ? nums : undefined
  }

  return arr.map((x) => String(x).trim()).filter(Boolean)
}

/** 列表字段：先拆 list，再逐项 resolve，去重 */
export function resolveFilterListValues(raw, field, options) {
  const valueType = field.valueType ?? 'string'
  const items = parseToFilterList(raw, valueType, field)
  if (!items?.length) return undefined

  const resolved = items
    .map((v) => resolveOneFilterValue(v, options, field))
    .filter((v) => v != null && v !== '')

  if (!resolved.length) return undefined

  const seen = new Set()
  const out = []
  for (const v of resolved) {
    const key = valueType === 'number' ? `n:${Number(v)}` : `s:${String(v)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(v)
  }
  return out
}

export function coerceToScalarString(value) {
  if (Array.isArray(value)) {
    const parts = value.map((x) => String(x).trim()).filter(Boolean)
    return parts.length ? parts[0] : ''
  }
  return String(value ?? '').trim()
}
