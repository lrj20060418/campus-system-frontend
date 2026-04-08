import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import HomePage from './pages/HomePage.jsx'
import SearchResultPage from './pages/SearchResultPage.jsx'
import DetailPage from './pages/DetailPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { paths } from './routes/paths.js'
import './App.css'

const { Header, Content, Footer } = Layout

function App() {
  return (
    <BrowserRouter>
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="app-logo">校园百事通</div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            items={[
              { key: 'home', label: <Link to={paths.home}>首页</Link> },
              { key: 'admin', label: <Link to={paths.admin}>管理</Link> },
              { key: 'profile', label: <Link to={paths.profile}>查询记录</Link> },
            ]}
          />
        </Header>
        <Content className="app-content">
          <Routes>
            <Route path={paths.home} element={<HomePage />} />
            <Route path={paths.search} element={<SearchResultPage />} />
            <Route path="/detail/:entity/:id" element={<DetailPage />} />
            <Route path={paths.admin} element={<AdminPage />} />
            <Route path={paths.profile} element={<ProfilePage />} />
            <Route path="*" element={<Navigate to={paths.home} replace />} />
          </Routes>
        </Content>
        <Footer className="app-footer">复旦校园百事通 · mock 数据演示</Footer>
      </Layout>
    </BrowserRouter>
  )
}

export default App
