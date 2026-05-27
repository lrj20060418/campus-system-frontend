import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { paths } from '../routes/paths.js'
import RequireAuth from './RequireAuth.jsx'

export default function RequireRole({ role, children }) {
  const { user } = useAuth()

  return (
    <RequireAuth>
      {user?.role === role ? children : <Navigate to={paths.home} replace />}
    </RequireAuth>
  )
}
