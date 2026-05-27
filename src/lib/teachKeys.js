
const SEP = '~'

export function teachKeysFromRow(row) {
  if (!row || typeof row !== 'object') {
    return {
      teacher_id: NaN,
      course_id: '',
      semester: '',
      section_no: '',
    }
  }
  return {
    teacher_id: Number(row.teacher_id),
    course_id: String(row.course_id ?? '').trim(),
    semester: String(row.semester ?? '').trim(),
    section_no: String(row.section_no ?? '').trim(),
  }
}

export function formatTeachRouteId(row) {
  const k = teachKeysFromRow(row)
  return [
    k.teacher_id,
    encodeURIComponent(k.course_id),
    encodeURIComponent(k.semester),
    encodeURIComponent(k.section_no),
  ].join(SEP)
}

export function parseTeachRouteId(rawId) {
  const parts = String(rawId ?? '').split(SEP)
  if (parts.length < 4) return null
  const teacher_id = Number(parts[0])
  if (Number.isNaN(teacher_id)) return null
  return {
    teacher_id,
    course_id: decodeURIComponent(parts[1] ?? ''),
    semester: decodeURIComponent(parts[2] ?? ''),
    section_no: decodeURIComponent(parts[3] ?? ''),
  }
}

export function teachRowsMatch(row, keys) {
  if (!keys || !row) return false
  const k = teachKeysFromRow(row)
  return (
    k.teacher_id === keys.teacher_id &&
    k.course_id === keys.course_id &&
    k.semester === keys.semester &&
    k.section_no === keys.section_no
  )
}

/** 后端按复合主键 filter/remove/update：标量（teacher_id int，其余 string） */
export function teachKeysAsScalarBody(keys) {
  if (!keys) {
    return {
      teacher_id: null,
      course_id: '',
      semester: '',
      section_no: '',
    }
  }
  const k = teachKeysFromRow(keys)
  return {
    teacher_id: Number.isFinite(k.teacher_id) ? k.teacher_id : null,
    course_id: k.course_id,
    semester: k.semester,
    section_no: k.section_no,
  }
}

/** POST /teach/filter（详情按复合主键） */
export function buildTeachFilterBody(rawId) {
  return teachKeysAsScalarBody(parseTeachRouteId(rawId))
}

/** POST /teach/remove（与 filter 主键格式相同） */
export function buildTeachRemoveBody(rawId) {
  return teachKeysAsScalarBody(parseTeachRouteId(rawId))
}

export const TEACH_HOME_FILTER_FIELDS = [
  { value: 'teacher_name', label: '教师姓名' },
  { value: 'course_name', label: '课程名' },
  { value: 'semester', label: '学期' },
]

const TEACH_HOME_FIELD_SET = new Set(
  TEACH_HOME_FILTER_FIELDS.map((o) => o.value),
)

/**
 * 首页授课搜索 POST /teach/filter：仅填选中的维度，其余为空字符串
 * @param {string} keyword
 * @param {'teacher_name'|'course_name'|'semester'} field
 */
export function buildTeachHomeFilterBody(keyword, field = 'teacher_name') {
  const v = String(keyword ?? '').trim()
  const key = TEACH_HOME_FIELD_SET.has(field) ? field : 'teacher_name'
  return {
    teacher_name: key === 'teacher_name' ? v : '',
    course_name: key === 'course_name' ? v : '',
    semester: key === 'semester' ? v : '',
  }
}
