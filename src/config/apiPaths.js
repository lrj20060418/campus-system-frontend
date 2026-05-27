/**
 * 与 Apifox 对齐的路径（小写 segment，与常见 Spring/Nginx 路由一致）
 */
export const apiPaths = {
  authLogin: import.meta.env.VITE_AUTH_LOGIN_PATH ?? '/auth/login',
  authRegister: import.meta.env.VITE_AUTH_REGISTER_PATH ?? '/auth/register',
  /** 自然语言查询：POST { query, user_id } */
  nlSearch: import.meta.env.VITE_NL_SEARCH_PATH ?? '/search',
  queryRecordSearch:
    import.meta.env.VITE_QUERY_RECORD_SEARCH_PATH ?? '/query_record/search',
  queryRecordUpload:
    import.meta.env.VITE_QUERY_RECORD_UPLOAD_PATH ?? '/query_record/upload',
  queryRecordFilter:
    import.meta.env.VITE_QUERY_RECORD_FILTER_PATH ?? '/query_record/filter',
  queryRecordUpdate:
    import.meta.env.VITE_QUERY_RECORD_UPDATE_PATH ?? '/query_record/update',
  queryRecordRemove:
    import.meta.env.VITE_QUERY_RECORD_REMOVE_PATH ?? '/query_record/remove',
  /** 管理员注册时请求 JSON 中角色字段名，须与后端 DTO 一致（默认 role） */
  authRegisterRoleField:
    String(import.meta.env.VITE_AUTH_REGISTER_ROLE_FIELD ?? 'role').trim() || 'role',
  /** 管理员注册时角色取值（默认 admin；若后端要枚举大写可设为 ADMIN） */
  authRegisterAdminRoleValue:
    String(import.meta.env.VITE_AUTH_REGISTER_ADMIN_ROLE ?? 'admin').trim() || 'admin',
}

/** 各实体目录名（小写），对应 POST /{entity}/search */
export const ENTITY_API_NAMES = [
  'campus',
  'building',
  'facility',
  'teacher',
  'course',
  'event',
]

/**
 * POST /{entity}/search 的请求体：每种实体用「主名称字段」承载搜索词（与 Apifox 中 campus 示例一致）。
 * 若某实体后端字段不同，只改下面 switch。
 */
export function buildEntitySearchBody(entity, keyword) {
  const v = keyword ?? ''
  switch (entity) {
    case 'campus':
      return { campus_name: v }
    case 'building':
      return { building_name: v }
    case 'facility':
      return { facility_name: v }
    case 'teacher':
      return { teacher_name: v }
    case 'course':
      return { course_name: v }
    case 'event':
      return { event_name: v }
    default:
      return { keyword: v }
  }
}
