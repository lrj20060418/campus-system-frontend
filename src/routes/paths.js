export const paths = {
  home: '/',
  search: '/search',
  detail: (entity, id) => `/detail/${entity}/${id}`,
  admin: '/admin',
  ask: '/ask',
  profile: '/profile',
  me: '/me',
  login: '/login',
  /** 不在主导航展示，仅通过直接访问 URL 打开管理员注册 */
  adminRegister: '/register/admin',
}
