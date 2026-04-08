/** 集中存放 mock 数据；通过下方 Row 函数变更，便于与后端 api 层对齐后替换实现 */

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
    floor: '',
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
    semester: '',
    credit: null,
  },
  {
    course_id: 402,
    course_name: '校园学习',
    offering_department: '计算机科学技术学院',
    semester: '',
    credit: null,
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
    floor: payload.floor ?? '',
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
    const merged = { ...c, ...payload, course_id: nid }
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

/** 模拟当前用户 id；接后端后由登录态 / JWT 决定 */
export const MOCK_CURRENT_USER_ID = 1

function nextQueryRecordId() {
  if (!queryRecords.length) return 1
  return Math.max(...queryRecords.map((r) => Number(r.record_id) || 0)) + 1
}

/** 写入一条查询记录（mock）；后端对齐：POST /api/query-records 或由搜索接口一并返回 */
export function appendQueryRecordRow(payload) {
  const row = {
    record_id: nextQueryRecordId(),
    user_id: payload.user_id ?? MOCK_CURRENT_USER_ID,
    query_text: payload.query_text,
    query_type: payload.query_type,
    query_time: payload.query_time ?? new Date().toISOString(),
    status: payload.status,
    result_count: payload.result_count ?? 0,
  }
  queryRecords = [row, ...queryRecords]
  return row
}

/** 模拟当前用户的查询记录（新记录在前） */
export let queryRecords = [
  {
    record_id: 1,
    user_id: MOCK_CURRENT_USER_ID,
    query_text: '邯郸校区有哪些食堂',
    query_time: '2026-04-01T02:00:00.000Z',
    query_type: 'keyword',
    status: 'success',
    result_count: 2,
  },
]
