/** 集中存放 mock 数据，各模块 api 从此导入 */

export const campuses = [
  { campus_id: 1, campus_name: '邯郸校区', address: '杨浦区邯郸路220号' },
  { campus_id: 2, campus_name: '江湾校区', address: '杨浦区淞沪路2005号' },
]

export const buildings = [
  { building_id: 101, campus_id: 1, building_name: '光华楼', building_type: '教学楼' },
  { building_id: 102, campus_id: 1, building_name: '旦苑食堂', building_type: '餐饮' },
]

export const facilities = [
  {
    facility_id: 201,
    building_id: 102,
    facility_name: '旦苑一楼餐厅',
    facility_type: '食堂',
    open_time: '06:30–22:00',
  },
]

export const teachers = [
  { teacher_id: 301, teacher_name: '张老师', department: '计算机科学技术学院' },
]

export const courses = [
  {
    course_id: 401,
    course_name: '数据库系统',
    offering_department: '计算机科学技术学院',
  },
  {
    course_id: 402,
    course_name: '校园学习',
    offering_department: '计算机科学技术学院',
  },
]

export const events = [
  {
    event_id: 501,
    building_id: 101,
    event_name: '校园讲座',
    start_time: '2026-04-10 14:00',
    organizer: '学生会',
  },
]

/** 模拟当前用户的查询记录 */
export let queryRecords = [
  {
    record_id: 1,
    query_text: '邯郸校区有哪些食堂',
    query_time: '2026-04-01 10:00',
    query_type: 'keyword',
  },
]
