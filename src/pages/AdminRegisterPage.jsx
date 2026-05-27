import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Alert, Button, Form, Input, Typography } from 'antd'
import { getApiBaseUrl } from '../lib/request.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import { paths } from '../routes/paths.js'

const { Text, Paragraph } = Typography

export default function AdminRegisterPage() {
  const { user, register } = useAuth()
  const [err, setErr] = useState('')
  const [okMsg, setOkMsg] = useState('')

  async function onRegister({ username, password, confirm }) {
    setErr('')
    setOkMsg('')
    if (password !== confirm) {
      setErr('两次输入的密码不一致')
      return
    }
    try {
      const nextUser = await register(username, password, { admin: true, role: 'admin' })
      if (nextUser) {
        return
      }
      setOkMsg(
        getApiBaseUrl()
          ? '注册成功，请使用新管理员账号登录'
          : '注册成功，请前往登录页使用新账号登录',
      )
    } catch (e) {
      setErr(e.message ?? '注册失败')
    }
  }

  if (user) {
    return <Navigate to={paths.home} replace />
  }

  return (
    <div className="page">
      <h2 style={{ marginTop: 0 }}>管理员注册</h2>
      <Paragraph type="secondary">
        本页不在主导航中，仅通过地址 <Text code>{paths.adminRegister}</Text> 访问。请求{' '}
        <Text code>POST /auth/register</Text>，JSON 含 <Text code>username</Text>、
        <Text code>password</Text>、<Text code>role</Text> 为 <Text code>admin</Text>。
      </Paragraph>
      {err ? (
        <Alert type="error" message={err} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      {okMsg ? (
        <Alert type="success" message={okMsg} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <Form layout="vertical" onFinish={onRegister} style={{ maxWidth: 360 }}>
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input autoComplete="username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="确认密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            注册为管理员
          </Button>
        </Form.Item>
      </Form>
      <p className="muted">
        <Link to={paths.home}>返回首页</Link>
        {' · '}
        <Link to={paths.login}>普通用户登录 / 注册</Link>
      </p>
    </div>
  )
}
