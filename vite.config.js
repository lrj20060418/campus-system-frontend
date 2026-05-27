import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = (env.VITE_PROXY_TARGET ?? '').trim()
  const apiBase = (env.VITE_API_BASE_URL ?? '').trim()

  /** 开发时：若 VITE_API_BASE_URL 为「以 / 开头的本地前缀」且配置了 VITE_PROXY_TARGET，则走代理并忽略上游自签证书 */
  const useDevProxy =
    mode === 'development' &&
    proxyTarget &&
    apiBase.startsWith('/') &&
    !apiBase.startsWith('//')

  const proxy = {}
  if (useDevProxy) {
    proxy[apiBase] = {
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => {
        if (path.startsWith(apiBase)) {
          const rest = path.slice(apiBase.length)
          return rest.startsWith('/') ? rest : `/${rest}`
        }
        return path
      },
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy,
    },
  }
})
