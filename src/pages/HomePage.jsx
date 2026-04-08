import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Space, Select } from 'antd'
import { paths } from '../routes/paths.js'


export default function HomePage() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const [entity, setEntity] = useState('all')
  function onSearch() {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (entity && entity !== 'all') params.set('entity', entity)
    navigate(`${paths.search}?${params.toString()}`)
  }

  return (
    <div className="page home-page">
      <h1>复旦校园百事通</h1>
      <p className="muted">输入关键词，搜索校区、建筑、设施、课程、教师与活动（mock）</p>
      <Space.Compact style={{ width: '100%', maxWidth: 720 }}>
        <Select
          value={entity}
          onChange={setEntity}
          style={{ width: 160 }}
          options={[
            { value: 'all', label: '全部' },
            { value: 'campus', label: '校区' },
            { value: 'building', label: '建筑' },
            { value: 'facility', label: '设施' },
            { value: 'teacher', label: '教师' },
            { value: 'course', label: '课程' },
            { value: 'event', label: '活动' },
          ]}
        />
        <Input
          placeholder="例如：食堂、数据库、邯郸"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={onSearch}
        />
        <Button type="primary" onClick={onSearch}>
          搜索
        </Button>
      </Space.Compact>
    </div>
  )
}
