/**
 * 高级筛选：各实体 POST /{entity}/filter 可填字段（支持列表的用 tagList / idList）
 * valueType: 'number' | 'string' — idList 元素类型
 */
export const FILTER_ENTITY_OPTIONS = [
  { value: 'campus', label: '校区' },
  { value: 'building', label: '建筑' },
  { value: 'facility', label: '设施' },
  { value: 'teacher', label: '教师' },
  { value: 'course', label: '课程' },
  { value: 'event', label: '活动' },
  { value: 'teach', label: '授课' },
]

/** @typedef {'text'|'idList'|'tagList'|'select'|'number'} FilterFieldType */

/**
 * @type {Record<string, Array<{ name: string, label: string, type: FilterFieldType, valueType?: 'number'|'string', options?: {value:string,label:string}[], placeholder?: string }>>}
 */
export const ENTITY_FILTER_SCHEMAS = {
  campus: [
    { name: 'campus_id', label: '校区ID', type: 'idList', valueType: 'number', placeholder: '多个用逗号分隔' },
    {
      name: 'campus_name',
      label: '校区名称',
      type: 'text',
      asList: true,
      placeholder: '模糊匹配，多个用逗号分隔',
    },
  ],
  building: [
    { name: 'building_id', label: '建筑ID', type: 'idList', valueType: 'number' },
    { name: 'campus_id', label: '校区ID', type: 'idList', valueType: 'number' },
    { name: 'building_name', label: '建筑名称', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
    { name: 'building_type', label: '建筑类型', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
  ],
  facility: [
    { name: 'facility_id', label: '设施ID', type: 'idList', valueType: 'number' },
    { name: 'building_id', label: '建筑ID', type: 'idList', valueType: 'number' },
    { name: 'facility_name', label: '设施名称', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
    { name: 'facility_type', label: '设施类型', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
  ],
  teacher: [
    { name: 'teacher_id', label: '教师ID', type: 'idList', valueType: 'number' },
    { name: 'teacher_name', label: '教师姓名', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
    { name: 'department', label: '院系', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
    { name: 'email', label: '邮箱', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
  ],
  course: [
    { name: 'course_id', label: '课程编号', type: 'idList', valueType: 'string', placeholder: '如 CS20001' },
    { name: 'course_name', label: '课程名称', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
    { name: 'offering_department', label: '开课院系', type: 'tagList', placeholder: '多个用逗号分隔' },
    { name: 'semester', label: '学期', type: 'tagList' },
  ],
  event: [
    { name: 'event_id', label: '活动ID', type: 'idList', valueType: 'number' },
    { name: 'building_id', label: '建筑ID', type: 'idList', valueType: 'number' },
    { name: 'event_name', label: '活动名称', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
    { name: 'organizer', label: '主办单位', type: 'text', asList: true, placeholder: '多个用逗号分隔' },
  ],
  teach: [
    { name: 'teacher_id', label: '教师ID', type: 'idList', valueType: 'number' },
    { name: 'teacher_name', label: '教师姓名', type: 'text', asList: false, placeholder: '如 张晨' },
    { name: 'course_id', label: '课程编号', type: 'idList', valueType: 'string' },
    { name: 'course_name', label: '课程名称', type: 'text', asList: false, placeholder: '如 数据结构' },
    { name: 'semester', label: '学期', type: 'text', asList: false, placeholder: '如 2025-Fall' },
    { name: 'section_no', label: '班次', type: 'text', asList: false, placeholder: '如 01' },
    {
      name: 'teach_role',
      label: '授课角色',
      type: 'select',
      options: [
        { value: '教师', label: '教师' },
        { value: '助教', label: '助教' },
      ],
    },
  ],
}

export function getFilterSchema(entity) {
  return ENTITY_FILTER_SCHEMAS[entity] ?? []
}
