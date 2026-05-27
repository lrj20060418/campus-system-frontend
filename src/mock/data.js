/** 集中存放 mock 数据；通过下方 Row 函数变更，便于与后端 api 层对齐后替换实现 */

import { parseTeachRouteId, teachRowsMatch } from '../lib/teachKeys.js'

/**
 * 预置账号（mock 明文密码，仅演示）：
 * - 普通用户：用户名 user / 密码 user123
 * - 管理员：用户名 admin / 密码 admin123
 */
export let mockUsers = [
  {
    user_id: 1,
    username: 'user',
    password: 'user123',
    role: 'user',
    created_at: '2026-01-15T08:00:00.000Z',
  },
  {
    user_id: 2,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    created_at: '2026-01-10T08:00:00.000Z',
  },
]

/** 当前登录会话（接后端后由 token 解析或 Cookie 同步） */
export let mockSession = {
  userId: null,
  token: null,
}

export function getActiveUserId() {
  return mockSession.userId
}

export function setMockSession(userId, token) {
  mockSession.userId = userId
  mockSession.token = token
}

export function clearMockSession() {
  mockSession.userId = null
  mockSession.token = null
}

import { STORAGE_USER_ID_KEY, STORAGE_USER_JSON_KEY } from '../lib/authStorage.js'

/** 用 localStorage 里的 token 恢复会话（mock token 形如 mock-<userId>；真实 JWT 需配合 campus_user_id） */
export function syncMockSessionFromToken(token) {
  if (!token || typeof token !== 'string') {
    if (typeof localStorage === 'undefined') {
      clearMockSession()
      return
    }
    // 后端仅返回用户信息、无 JWT 时：凭 campus_user_id + 缓存用户 JSON 恢复内存会话
    const sid = localStorage.getItem(STORAGE_USER_ID_KEY)
    const hasUserJson = localStorage.getItem(STORAGE_USER_JSON_KEY)
    if (sid != null && sid !== '' && hasUserJson) {
      mockSession.userId = Number(sid)
      mockSession.token = null
      return
    }
    clearMockSession()
    return
  }
  if (token.startsWith('mock-')) {
    const id = Number(token.slice('mock-'.length))
    const u = mockUsers.find((x) => x.user_id === id)
    if (u) {
      mockSession.userId = id
      mockSession.token = token
    } else {
      clearMockSession()
    }
    return
  }
  if (typeof localStorage === 'undefined') {
    clearMockSession()
    return
  }
  const sid = localStorage.getItem(STORAGE_USER_ID_KEY)
  if (sid != null && sid !== '') {
    mockSession.userId = Number(sid)
    mockSession.token = token
  } else {
    clearMockSession()
  }
}

export function findMockUserByCredentials(username, password) {
  return (
    mockUsers.find(
      (u) => u.username === username && u.password === password,
    ) ?? null
  )
}

/** 无后端时本地演示注册（用户名不可重复）；role 默认 user，管理员页可传 admin */
export function registerMockUser(username, password, role = 'user') {
  const name = String(username ?? '').trim()
  if (!name) throw new Error('请输入用户名')
  if (mockUsers.some((u) => u.username === name)) {
    throw new Error('用户名已存在')
  }
  const user_id = nextIdFor(mockUsers, 'user_id')
  const r = role === 'admin' ? 'admin' : 'user'
  const row = {
    user_id,
    username: name,
    password: String(password ?? ''),
    role: r,
    created_at: new Date().toISOString(),
  }
  mockUsers.push(row)
  return row
}

export function getMockUserById(userId) {
  const id = Number(userId)
  return mockUsers.find((u) => u.user_id === id) ?? null
}

function nextIdFor(rows, key) {
  if (!rows.length) return 1
  return Math.max(...rows.map((r) => Number(r[key]) || 0)) + 1
}

export let campuses = [
  { campus_id: 1, campus_name: '邯郸校区', address: '杨浦区邯郸路220号' },
  { campus_id: 2, campus_name: '江湾校区', address: '杨浦区淞沪路2005号' },
]

export let buildings = [
  { building_id: 101, campus_id: 1, building_name: '光华楼', building_type: '教学楼' },
  { building_id: 102, campus_id: 1, building_name: '旦苑食堂', building_type: '餐饮' },
]

export let facilities = [
  {
    facility_id: 201,
    building_id: 102,
    facility_name: '旦苑一楼餐厅',
    facility_type: '食堂',
    open_time: '06:30–22:00',
  },
]

export let teachers = [
  {
    teacher_id: 301,
    teacher_name: '张老师',
    department: '计算机科学技术学院',
    email: '',
  },
]

export let courses = [
  {
    course_id: 401,
    course_name: '数据库系统',
    offering_department: '计算机科学技术学院',
    credit: null,
  },
  {
    course_id: 402,
    course_name: '校园学习',
    offering_department: '计算机科学技术学院',
    credit: null,
  },
  {
    course_id: 'CS20001',
    course_name: '数据结构',
    offering_department: '计算机科学技术学院',
    credit: 4,
  },
]

export let teaches = [
  {
    teacher_id: 301,
    course_id: 'CS20001',
    semester: '2025-Fall',
    section_no: '01',
    teach_role: '教师',
    start_time: '2025-09-08 08:00:00',
    end_time: '2026-01-12 18:00:00',
    create_time: '2026-05-13 10:08:25',
    update_time: '2026-05-13 10:08:25',
  },
  {
    teacher_id: 301,
    course_id: 'CS20001',
    semester: '2025-Fall',
    section_no: '02',
    teach_role: '教师',
    start_time: '2025-09-08 08:00:00',
    end_time: '2026-01-12 18:00:00',
    create_time: '2026-05-13 10:08:27',
    update_time: '2026-05-13 10:08:27',
  },
  {
    teacher_id: 301,
    course_id: 'CS20001',
    semester: '2026-Spring',
    section_no: '01',
    teach_role: '教师',
    start_time: '2026-02-23 08:00:00',
    end_time: '2026-06-30 18:00:00',
    create_time: '2026-05-13 10:08:26',
    update_time: '2026-05-13 10:08:26',
  },
]

export let events = [
  {
    event_id: 501,
    building_id: 101,
    event_name: '校园讲座',
    start_time: '2026-04-10 14:00',
    end_time: '',
    organizer: '学生会',
    description: '',
  },
]

/* ---------- Campus ---------- */
export function createCampusRow(payload) {
  const row = {
    campus_id: nextIdFor(campuses, 'campus_id'),
    campus_name: payload.campus_name,
    address: payload.address ?? '',
  }
  campuses = [...campuses, row]
  return row
}

export function updateCampusRow(id, payload) {
  const nid = Number(id)
  campuses = campuses.map((c) =>
    c.campus_id === nid ? { ...c, ...payload, campus_id: nid } : c,
  )
}

export function deleteCampusRow(id) {
  const nid = Number(id)
  if (buildings.some((b) => b.campus_id === nid)) {
    throw new Error('该校区下仍有建筑，无法删除')
  }
  campuses = campuses.filter((c) => c.campus_id !== nid)
}

/* ---------- Building ---------- */
export function createBuildingRow(payload) {
  const row = {
    building_id: nextIdFor(buildings, 'building_id'),
    campus_id: Number(payload.campus_id),
    building_name: payload.building_name,
    building_type: payload.building_type,
  }
  buildings = [...buildings, row]
  return row
}

export function updateBuildingRow(id, payload) {
  const nid = Number(id)
  buildings = buildings.map((b) =>
    b.building_id === nid
      ? {
          ...b,
          ...payload,
          building_id: nid,
          campus_id: Number(payload.campus_id ?? b.campus_id),
        }
      : b,
  )
}

export function deleteBuildingRow(id) {
  const nid = Number(id)
  if (facilities.some((f) => f.building_id === nid)) {
    throw new Error('该建筑下仍有设施，无法删除')
  }
  if (events.some((e) => e.building_id === nid)) {
    throw new Error('该建筑仍有关联活动，无法删除')
  }
  buildings = buildings.filter((b) => b.building_id !== nid)
}

/* ---------- Facility ---------- */
export function createFacilityRow(payload) {
  const row = {
    facility_id: nextIdFor(facilities, 'facility_id'),
    building_id: Number(payload.building_id),
    facility_name: payload.facility_name,
    facility_type: payload.facility_type,
    open_time: payload.open_time ?? '',
  }
  facilities = [...facilities, row]
  return row
}

export function updateFacilityRow(id, payload) {
  const nid = Number(id)
  facilities = facilities.map((f) =>
    f.facility_id === nid
      ? {
          ...f,
          ...payload,
          facility_id: nid,
          building_id: Number(payload.building_id ?? f.building_id),
        }
      : f,
  )
}

export function deleteFacilityRow(id) {
  const nid = Number(id)
  facilities = facilities.filter((f) => f.facility_id !== nid)
}

/* ---------- Teacher ---------- */
export function createTeacherRow(payload) {
  const row = {
    teacher_id: nextIdFor(teachers, 'teacher_id'),
    teacher_name: payload.teacher_name,
    department: payload.department ?? '',
    email: payload.email ?? '',
  }
  teachers = [...teachers, row]
  return row
}

export function updateTeacherRow(id, payload) {
  const nid = Number(id)
  teachers = teachers.map((t) =>
    t.teacher_id === nid ? { ...t, ...payload, teacher_id: nid } : t,
  )
}

export function deleteTeacherRow(id) {
  const nid = Number(id)
  teachers = teachers.filter((t) => t.teacher_id !== nid)
}

/* ---------- Course ---------- */
export function createCourseRow(payload) {
  const creditRaw = payload.credit
  const row = {
    course_id: nextIdFor(courses, 'course_id'),
    course_name: payload.course_name,
    offering_department: payload.offering_department ?? '',
    semester: payload.semester ?? '',
    credit:
      creditRaw === '' || creditRaw === null || creditRaw === undefined
        ? null
        : Number(creditRaw),
  }
  courses = [...courses, row]
  return row
}

export function updateCourseRow(id, payload) {
  const nid = Number(id)
  courses = courses.map((c) => {
    if (c.course_id !== nid) return c
    const merged = { ...c, ...payload }
    if (Object.prototype.hasOwnProperty.call(payload, 'course_id')) {
      const raw = payload.course_id
      const next =
        raw != null && String(raw).trim() !== '' ? Number(String(raw).trim()) : nid
      merged.course_id = Number.isFinite(next) ? next : nid
    } else {
      merged.course_id = nid
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'credit')) {
      const creditRaw = payload.credit
      merged.credit =
        creditRaw === '' || creditRaw === null || creditRaw === undefined
          ? null
          : Number(creditRaw)
    }
    return merged
  })
}

export function deleteCourseRow(id) {
  const nid = Number(id)
  courses = courses.filter((c) => c.course_id !== nid)
}

/* ---------- Event ---------- */
export function createEventRow(payload) {
  const row = {
    event_id: nextIdFor(events, 'event_id'),
    building_id: Number(payload.building_id),
    event_name: payload.event_name,
    start_time: payload.start_time ?? '',
    end_time: payload.end_time ?? '',
    organizer: payload.organizer ?? '',
    description: payload.description ?? '',
  }
  events = [...events, row]
  return row
}

export function updateEventRow(id, payload) {
  const nid = Number(id)
  events = events.map((e) =>
    e.event_id === nid
      ? {
          ...e,
          ...payload,
          event_id: nid,
          building_id: Number(payload.building_id ?? e.building_id),
        }
      : e,
  )
}

export function deleteEventRow(id) {
  const nid = Number(id)
  events = events.filter((e) => e.event_id !== nid)
}

/* ---------- Teach（授课） ---------- */
function teachRowKey(row) {
  return `${row.teacher_id}|${row.course_id}|${row.semester}|${row.section_no}`
}

export function createTeachRow(payload) {
  const row = {
    teacher_id: Number(payload.teacher_id),
    course_id: String(payload.course_id ?? '').trim(),
    semester: String(payload.semester ?? '').trim(),
    section_no: String(payload.section_no ?? '').trim(),
    teach_role: String(payload.teach_role ?? '').trim(),
    start_time: String(payload.start_time ?? '').trim(),
    end_time: String(payload.end_time ?? '').trim(),
    create_time: new Date().toISOString(),
    update_time: new Date().toISOString(),
  }
  if (teaches.some((t) => teachRowKey(t) === teachRowKey(row))) {
    throw new Error('该授课记录已存在（教师、课程、学期、班次组合重复）')
  }
  teaches = [...teaches, row]
  return row
}

export function updateTeachRow(routeId, payload) {
  const keys = parseTeachRouteId(routeId)
  if (!keys) throw new Error('无效的授课记录标识')
  teaches = teaches.map((t) => {
    if (!teachRowsMatch(t, keys)) return t
    return {
      ...t,
      ...payload,
      teacher_id: Number(payload.teacher_id ?? t.teacher_id),
      course_id: String(payload.course_id ?? t.course_id).trim(),
      semester: String(payload.semester ?? t.semester).trim(),
      section_no: String(payload.section_no ?? t.section_no).trim(),
      update_time: new Date().toISOString(),
    }
  })
}

export function deleteTeachRow(routeId) {
  const keys = parseTeachRouteId(routeId)
  if (!keys) throw new Error('无效的授课记录标识')
  const before = teaches.length
  teaches = teaches.filter((t) => !teachRowsMatch(t, keys))
  if (teaches.length === before) throw new Error('授课记录不存在')
}

function nextQueryRecordId() {
  if (!queryRecords.length) return 1
  return Math.max(...queryRecords.map((r) => Number(r.record_id) || 0)) + 1
}

/** 写入一条查询记录（mock）；后端对齐：POST /api/query-records 或由搜索接口一并返回 */
export function appendQueryRecordRow(payload) {
  const uid = payload.user_id ?? getActiveUserId()
  if (uid == null) {
    throw new Error('写入查询记录失败：当前未登录')
  }
  const row = {
    record_id: nextQueryRecordId(),
    user_id: uid,
    query_text: payload.query_text,
    query_type: payload.query_type,
    query_time: payload.query_time ?? new Date().toISOString(),
    status: payload.status,
    result_count: payload.result_count ?? 0,
    entity_scope: payload.entity_scope ?? 'all',
    answer: payload.answer ?? '',
  }
  queryRecords = [row, ...queryRecords]
  return row
}

export function updateQueryRecordRow(id, payload) {
  const nid = Number(id)
  const idx = queryRecords.findIndex(
    (r) => Number(r.record_id ?? r.id) === nid,
  )
  if (idx === -1) throw new Error('记录不存在')
  const next = { ...queryRecords[idx], ...payload, record_id: nid }
  queryRecords = [
    ...queryRecords.slice(0, idx),
    next,
    ...queryRecords.slice(idx + 1),
  ]
  return next
}

export function deleteQueryRecordRow(id) {
  const nid = Number(id)
  const before = queryRecords.length
  queryRecords = queryRecords.filter(
    (r) => Number(r.record_id ?? r.id) !== nid,
  )
  if (queryRecords.length === before) {
    throw new Error('记录不存在')
  }
}

/** 模拟查询记录（新记录在前）；每条带 user_id 便于按用户过滤 */
export let queryRecords = [
  {
    record_id: 1,
    user_id: 1,
    query_text: '邯郸校区有哪些教学楼',
    query_time: '2026-04-01T02:00:00.000Z',
    query_type: 'natural_language',
    status: 'success',
    answer: '邯郸校区的教学楼包括光华楼、理科楼、文科楼。',
  },
  {
    record_id: 2,
    user_id: 2,
    query_text: '江湾校区有哪些建筑',
    query_time: '2026-04-02T03:00:00.000Z',
    query_type: 'natural_language',
    status: 'success',
    answer: '（示例）江湾校区主要建筑可在管理后台查看。',
  },
]
