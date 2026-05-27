/** 与后端无关的存储 key，供 request / auth 共用，避免循环依赖 */

export const STORAGE_KEY = 'campus_mock_token'

/** 真实 JWT 登录后用于恢复 userId（mock token 不需要此项） */
export const STORAGE_USER_ID_KEY = 'campus_user_id'

/** 后端登录成功后缓存的用户 JSON（无 getMe 接口时用其恢复「我的账户」） */
export const STORAGE_USER_JSON_KEY = 'campus_user_json'
