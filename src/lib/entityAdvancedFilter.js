import {
  isAdvancedFilterListField,
  isAdvancedFilterScalarStringField,
} from '../config/entityFilterFieldFormats.js'
import { getFilterSchema } from '../config/entityFilterSchemas.js'
import {
  coerceToScalarString,
  isFilterIdFieldName,
  parseToFilterList,
  resolveFilterListValues,
  resolveOneFilterValue,
} from './filterValueResolve.js'
import { getApiBaseUrl, request } from './request.js'
import { asArray, mapEntityRowToListItem } from '../modules/query/entityBackendSearch.js'
import {
  campuses,
  buildings,
  facilities,
  teachers,
  courses,
  events,
  teaches,
} from '../mock/data.js'

const ENTITY_FILTER_PATH =
  import.meta.env.VITE_ENTITY_FILTER_PATH ?? '/filter'

function fieldValueType(field) {
  return field.valueType ?? 'string'
}

function shouldSendFilterAsList(entity, field) {
  if (isAdvancedFilterScalarStringField(entity, field.name)) return false
  if (field.type === 'idList') return true
  if (field.type === 'tagList') {
    return isAdvancedFilterListField(entity, field.name)
  }
  if (field.type === 'text') {
    if (field.asList === false) return false
    return isAdvancedFilterListField(entity, field.name) || field.asList === true
  }
  return isAdvancedFilterListField(entity, field.name)
}

/**
 * 提交前：把 Select 展示文案还原为 option.value / 尾部 ID
 */
export function resolveFilterFormValues(entity, formValues, fieldOptionsMap = {}) {
  if (!formValues || typeof formValues !== 'object') return formValues

  const schema = getFilterSchema(entity)
  const out = { ...formValues }

  for (const field of schema) {
    const key = field.name
    const raw = out[key]
    if (raw == null || raw === '') continue

    const opts = fieldOptionsMap[key]
    const isScalarString = isAdvancedFilterScalarStringField(entity, key)
    const needsResolve =
      field.type === 'idList' ||
      field.type === 'tagList' ||
      (field.type === 'text' && (field.asList || isScalarString))
    if (!needsResolve) continue

    if (isScalarString) {
      const single = Array.isArray(raw) ? raw[0] : raw
      const v = coerceToScalarString(resolveOneFilterValue(single, opts, field))
      if (v) out[key] = v
      else delete out[key]
      continue
    }

    const list = resolveFilterListValues(raw, field, opts)
    if (list?.length) out[key] = list
    else delete out[key]
  }

  return out
}

/** 兜底：list / string 格式与后端一致 */
export function normalizeAdvancedFilterBody(entity, body, fieldOptionsMap = {}) {
  if (!body || typeof body !== 'object') return body

  const schema = getFilterSchema(entity)
  const fieldByName = Object.fromEntries(schema.map((f) => [f.name, f]))
  const out = { ...body }

  for (const [key, value] of Object.entries(out)) {
    if (value == null || value === '') {
      delete out[key]
      continue
    }

    const field = fieldByName[key] ?? { name: key, type: 'text' }
    const opts = fieldOptionsMap[key]

    if (isAdvancedFilterScalarStringField(entity, key)) {
      const single = Array.isArray(value) ? value[0] : value
      const s = coerceToScalarString(resolveOneFilterValue(single, opts, field))
      if (s) out[key] = s
      else delete out[key]
      continue
    }

    if (!isAdvancedFilterListField(entity, key)) continue

    const list = resolveFilterListValues(value, field, opts)
    if (list?.length) out[key] = list
    else delete out[key]
  }

  return out
}

/** 将表单值转为 POST /{entity}/filter 的 JSON */
export function buildAdvancedFilterBody(entity, formValues, fieldOptionsMap = {}) {
  const resolved = resolveFilterFormValues(entity, formValues, fieldOptionsMap)
  const schema = getFilterSchema(entity)
  const body = {}

  for (const field of schema) {
    const raw = resolved?.[field.name]
    if (raw == null || raw === '') continue

    const asList = shouldSendFilterAsList(entity, field)
    const opts = fieldOptionsMap[field.name]

    switch (field.type) {
      case 'text':
      case 'idList':
      case 'tagList': {
        if (asList) {
          const list = resolveFilterListValues(raw, field, opts)
          if (list?.length) body[field.name] = list
        } else {
          const single = Array.isArray(raw) ? raw[0] : raw
          const s = coerceToScalarString(resolveOneFilterValue(single, opts, field))
          if (s) body[field.name] = s
        }
        break
      }
      case 'select': {
        const s = coerceToScalarString(raw)
        if (s) body[field.name] = s
        break
      }
      case 'number': {
        const n = Number(raw)
        if (!Number.isNaN(n)) body[field.name] = n
        break
      }
      default:
        break
    }
  }

  return normalizeAdvancedFilterBody(entity, body, fieldOptionsMap)
}

export function prepareAdvancedFilterRequest(entity, formValues, fieldOptionsMap = {}) {
  const resolvedValues = resolveFilterFormValues(entity, formValues, fieldOptionsMap)
  const body = buildAdvancedFilterBody(entity, resolvedValues, fieldOptionsMap)
  return { body, resolvedValues }
}

function mockRowsForEntity(entity) {
  switch (entity) {
    case 'campus':
      return campuses
    case 'building':
      return buildings
    case 'facility':
      return facilities
    case 'teacher':
      return teachers
    case 'course':
      return courses
    case 'event':
      return events
    case 'teach':
      return teaches.map((t) => {
        const teacher = teachers.find((tr) => tr.teacher_id === t.teacher_id)
        const course = courses.find(
          (c) => String(c.course_id).trim() === String(t.course_id).trim(),
        )
        return {
          ...t,
          teacher_name: teacher?.teacher_name ?? '',
          course_name: course?.course_name ?? '',
        }
      })
    default:
      return []
  }
}

function valueMatchesFilter(got, expected, fieldKey) {
  if (expected == null) return true
  const exactId = isFilterIdFieldName(fieldKey)

  if (Array.isArray(expected)) {
    if (expected.length === 0) return true
    if (Array.isArray(got)) {
      return expected.some((ex) =>
        got.some((g) => String(g) === String(ex) || Number(g) === Number(ex)),
      )
    }
    return expected.some((ex) => {
      if (exactId) {
        return Number(got) === Number(ex) || String(got) === String(ex)
      }
      const gotStr = String(got ?? '').toLowerCase()
      const exStr = String(ex).toLowerCase()
      return gotStr === exStr || gotStr.includes(exStr)
    })
  }
  if (typeof expected === 'number') {
    return Number(got) === expected
  }
  if (exactId) {
    return Number(got) === Number(expected) || String(got) === String(expected)
  }
  const gotStr = String(got ?? '').toLowerCase()
  const exStr = String(expected).toLowerCase()
  return gotStr === exStr || gotStr.includes(exStr)
}

function rowMatchesAdvancedFilter(row, body) {
  for (const [key, expected] of Object.entries(body)) {
    if (!valueMatchesFilter(row[key], expected, key)) return false
  }
  return true
}

/** 后端偶发未过滤时，用请求体在客户端再筛一层 */
function applyClientFilterGuard(entity, rows, body) {
  if (!body || !Object.keys(body).length) return rows
  return rows.filter((r) => rowMatchesAdvancedFilter(r, body))
}

function runMockAdvancedFilter(entity, body) {
  const rows = mockRowsForEntity(entity)
  return applyClientFilterGuard(entity, rows, body)
    .map((r) => mapEntityRowToListItem(entity, r))
    .filter((item) => item && item.id != null && String(item.id).trim() !== '')
}

/** POST /{entity}/filter */
export async function postEntityAdvancedFilter(entity, formValues, fieldOptionsMap = {}) {
  const { body } = prepareAdvancedFilterRequest(entity, formValues, fieldOptionsMap)

  if (!getApiBaseUrl()) {
    return runMockAdvancedFilter(entity, body)
  }

  const path = `/${entity}${ENTITY_FILTER_PATH}`
  const raw = await request(path, { method: 'POST', json: body })
  const rows = applyClientFilterGuard(entity, asArray(raw), body)
  return rows
    .map((r) => mapEntityRowToListItem(entity, r))
    .filter((item) => item && item.id != null && String(item.id).trim() !== '')
}
