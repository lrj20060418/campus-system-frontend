import { useState } from 'react'

import { Link, Navigate, useLocation } from 'react-router-dom'

import { Alert, Button, Form, Input, Tabs, Typography } from 'antd'

import { getApiBaseUrl } from '../lib/request.js'

import { useAuth } from '../auth/AuthProvider.jsx'

import { paths } from '../routes/paths.js'



const { Text, Paragraph } = Typography



export default function LoginPage() {

  const { user, login, register } = useAuth()

  const location = useLocation()

  const [err, setErr] = useState('')

  const [okMsg, setOkMsg] = useState('')

  const [tab, setTab] = useState('login')

  const from = location.state?.from || paths.home



  async function onLogin({ username, password }) {

    setErr('')

    setOkMsg('')

    try {

      await login(username, password)

    } catch (e) {

      setErr(e.message ?? '登录失败')

    }

  }



  async function onRegister({ username, password, confirm }) {

    setErr('')

    setOkMsg('')

    if (password !== confirm) {

      setErr('两次输入的密码不一致')

      return

    }

    try {

      const nextUser = await register(username, password)

      if (nextUser) {

        return

      }

      setOkMsg(

        getApiBaseUrl()

          ? '注册成功，请使用新账号登录'

          : '注册成功，请切换到「登录」使用新账号登录',

      )

      setTab('login')

    } catch (e) {

      setErr(e.message ?? '注册失败')

    }

  }



  if (user) {

    return <Navigate to={from} replace />

  }



  return (

    <div className="page">

      <Tabs

        activeKey={tab}

        onChange={(k) => {

          setTab(k)

          setErr('')

          setOkMsg('')

        }}

        items={[

          {

            key: 'login',

            label: '登录',

            children: (

              <>

                <h2 style={{ marginTop: 0 }}>登录</h2>

                {!getApiBaseUrl() ? (

                  <Paragraph type="secondary">

                    预置账号：普通用户 <Text code>user</Text> /{' '}

                    <Text code>user123</Text>；管理员 <Text code>admin</Text> /{' '}

                    <Text code>admin123</Text>

                  </Paragraph>

                ) : (

                  <Paragraph type="secondary">

                    已连接后端 <Text code>POST /auth/login</Text>

                  </Paragraph>

                )}

                {err ? (

                  <Alert

                    type="error"

                    title={err}

                    showIcon

                    style={{ marginBottom: 16 }}

                  />

                ) : null}

                {okMsg ? (

                  <Alert

                    type="success"

                    title={okMsg}

                    showIcon

                    style={{ marginBottom: 16 }}

                  />

                ) : null}

                <Form layout="vertical" onFinish={onLogin} style={{ maxWidth: 360 }}>

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

                    <Input.Password autoComplete="current-password" />

                  </Form.Item>

                  <Form.Item>

                    <Button type="primary" htmlType="submit" block>

                      登录

                    </Button>

                  </Form.Item>

                </Form>

              </>

            ),

          },

          {

            key: 'register',

            label: '注册',

            children: (

              <>

                <h2 style={{ marginTop: 0 }}>注册</h2>

                <Paragraph type="secondary">

                  请求 <Text code>POST /auth/register</Text>，JSON 字段{' '}

                  <Text code>username</Text>、<Text code>password</Text>（普通用户不传{' '}

                  <Text code>role</Text>；路径可用 <Text code>VITE_AUTH_REGISTER_PATH</Text> 覆盖）

                </Paragraph>

                {err ? (

                  <Alert

                    type="error"

                    title={err}

                    showIcon

                    style={{ marginBottom: 16 }}

                  />

                ) : null}

                <Form

                  layout="vertical"

                  onFinish={onRegister}

                  style={{ maxWidth: 360 }}

                >

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

                      注册

                    </Button>

                  </Form.Item>

                </Form>

              </>

            ),

          },

        ]}

      />

      <p className="muted">

        <Link to={paths.home}>返回首页</Link>

      </p>

    </div>

  )

}

