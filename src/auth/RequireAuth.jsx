import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from './AuthProvider.jsx'
import { paths } from '../routes/paths.js'

export default function RequireAuth({ children }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to={paths.login} replace state={{ from: location.pathname }} />
    )
  }

  return children
}
