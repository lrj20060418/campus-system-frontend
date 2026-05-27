import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { Button, Layout, Menu, Spin } from 'antd'
import HomePage from './pages/HomePage.jsx'
import SearchResultPage from './pages/SearchResultPage.jsx'
import FilterPage from './pages/FilterPage.jsx'
import DetailPage from './pages/DetailPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import NaturalLanguagePage from './pages/NaturalLanguagePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminRegisterPage from './pages/AdminRegisterPage.jsx'
import MePage from './pages/MePage.jsx'
import { paths } from './routes/paths.js'
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import RequireRole from './auth/RequireRole.jsx'
import './App.css'

const { Header, Content, Footer } = Layout

function AppShell() {
  const { user, ready, logout } = useAuth()

  const menuItems = [
    { key: 'home', label: <Link to={paths.home}>首页</Link> },
    { key: 'filter', label: <Link to={paths.filter}>高级筛选</Link> },
  ]

  if (user) {
    menuItems.push(
      { key: 'me', label: <Link to={paths.me}>我的账户</Link> },
      { key: 'ask', label: <Link to={paths.ask}>自然语言查询</Link> },
    )
    if (user.role === 'admin') {
      menuItems.push({ key: 'admin', label: <Link to={paths.admin}>管理</Link> })
    }
    menuItems.push({
      key: 'logout',
      label: (
        <Button
          type="link"
          onClick={() => logout()}
          style={{ color: 'rgba(255,255,255,0.85)', padding: '0 12px' }}
        >
          退出
        </Button>
      ),
    })
  } else {
    menuItems.push({ key: 'login', label: <Link to={paths.login}>登录</Link> })
  }

  if (!ready) {
    return (
      <Layout className="app-layout">
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="app-logo">校园百事通</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectable={false}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content className="app-content">
        <Routes>
          <Route path={paths.home} element={<HomePage />} />
          <Route path={paths.search} element={<SearchResultPage />} />
          <Route path={paths.filter} element={<FilterPage />} />
          <Route path="/detail/:entity/:id" element={<DetailPage />} />
          <Route path={paths.login} element={<LoginPage />} />
          <Route path={paths.adminRegister} element={<AdminRegisterPage />} />
          <Route
            path={paths.me}
            element={
              <RequireAuth>
                <MePage />
              </RequireAuth>
            }
          />
          <Route
            path={paths.ask}
            element={
              <RequireAuth>
                <NaturalLanguagePage />
              </RequireAuth>
            }
          />
          <Route path={paths.profile} element={<Navigate to={paths.ask} replace />} />
          <Route
            path={paths.admin}
            element={
              <RequireRole role="admin">
                <AdminPage />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to={paths.home} replace />} />
        </Routes>
      </Content>
      <Footer className="app-footer">复旦校园百事通</Footer>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
