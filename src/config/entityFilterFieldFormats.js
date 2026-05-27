/**
 * POST /{entity}/filter 各字段请求体格式（与后端 Pydantic 一致）
 * - list: 数组，如 ["邯郸校区"] 或 [1, 2]
 * - string: 单个字符串，如 "张晨"（授课筛选与首页 /teach/filter 一致）
 */

/** @type {Record<string, string[]>} */
export const ENTITY_FILTER_LIST_FIELDS = {
  campus: ['campus_id', 'campus_name'],
  building: ['building_id', 'campus_id', 'building_name', 'building_type'],
  facility: ['facility_id', 'building_id', 'facility_name', 'facility_type'],
  teacher: ['teacher_id', 'teacher_name', 'department', 'email'],
  course: ['course_id', 'course_name', 'offering_department', 'semester'],
  event: ['event_id', 'building_id', 'event_name', 'organizer'],
  teach: ['teacher_id', 'course_id'],
}

/** @type {Record<string, string[]>} */
export const ENTITY_FILTER_SCALAR_STRING_FIELDS = {
  teach: ['teacher_name', 'course_name', 'semester', 'section_no', 'teach_role'],
}

const LIST_FIELD_SETS = Object.fromEntries(
  Object.entries(ENTITY_FILTER_LIST_FIELDS).map(([entity, fields]) => [
    entity,
    new Set(fields),
  ]),
)

const SCALAR_STRING_SETS = Object.fromEntries(
  Object.entries(ENTITY_FILTER_SCALAR_STRING_FIELDS).map(([entity, fields]) => [
    entity,
    new Set(fields),
  ]),
)

export function isAdvancedFilterListField(entity, fieldName) {
  return LIST_FIELD_SETS[entity]?.has(fieldName) ?? false
}

export function isAdvancedFilterScalarStringField(entity, fieldName) {
  return SCALAR_STRING_SETS[entity]?.has(fieldName) ?? false
}

/** @returns {'list'|'string'|null} */
export function getAdvancedFilterFieldFormat(entity, fieldName) {
  if (isAdvancedFilterListField(entity, fieldName)) return 'list'
  if (isAdvancedFilterScalarStringField(entity, fieldName)) return 'string'
  return null
}
