import { Link } from 'react-router-dom'
import { Descriptions } from 'antd'
import { useAuth } from '../auth/AuthProvider.jsx'
import { paths } from '../routes/paths.js'

function roleLabel(role) {
  if (role === 'admin') return '管理员'
  if (role === 'user') return '普通用户'
  return role ?? '—'
}

export default function MePage() {
  const { user } = useAuth()

  return (
    <div className="page">
      <p>
        <Link to={paths.home}>返回首页</Link>
      </p>
      <h2>我的账户</h2>
      <Descriptions column={1} bordered size="small" style={{ maxWidth: 480 }}>
        <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
        <Descriptions.Item label="角色">{roleLabel(user.role)}</Descriptions.Item>
        <Descriptions.Item label="注册时间">
          {user.created_at
            ? new Date(user.created_at).toLocaleString()
            : '—'}
        </Descriptions.Item>
      </Descriptions>
      <p className="muted" style={{ marginTop: 16 }}>
        <Link to={paths.ask}>自然语言查询与记录</Link>
      </p>
    </div>
  )
}
