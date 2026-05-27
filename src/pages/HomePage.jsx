import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Space, Select } from 'antd'
import { paths } from '../routes/paths.js'
import { getApiBaseUrl } from '../lib/request.js'

const ENTITY_OPTIONS_ALL = [
  { value: 'all', label: '全部' },
  { value: 'campus', label: '校区' },
  { value: 'building', label: '建筑' },
  { value: 'facility', label: '设施' },
  { value: 'teacher', label: '教师' },
  { value: 'course', label: '课程' },
  { value: 'event', label: '活动' },
]

const BACKEND_ENTITY_OPTIONS = ENTITY_OPTIONS_ALL.filter((o) => o.value !== 'all')

export default function HomePage() {
  const useBackend = Boolean(getApiBaseUrl())
  const entityOptions = useMemo(
    () => (useBackend ? BACKEND_ENTITY_OPTIONS : ENTITY_OPTIONS_ALL),
    [useBackend],
  )

  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const [entity, setEntity] = useState(useBackend ? 'campus' : 'all')

  function onSearch() {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (useBackend) {
      params.set('entity', entity)
    } else if (entity && entity !== 'all') {
      params.set('entity', entity)
    }
    navigate(`${paths.search}?${params.toString()}`)
  }

  return (
    <div className="page home-page">
      <h1>复旦校园百事通</h1>
      <p className="muted">
        {useBackend
          ? '已连接后端：请选择类型后搜索（对应 POST /{类型}/search）。'
          : '输入关键词，搜索校区、建筑、设施、课程、教师与活动。'}
      </p>
      <Space.Compact style={{ width: '100%', maxWidth: 720 }}>
        <Select
          value={entity}
          onChange={setEntity}
          style={{ width: 160 }}
          options={entityOptions}
        />
        <Input
          placeholder={
            useBackend ? '例如：与 campus_name 等字段匹配的文本' : '例如：食堂、数据库、邯郸'
          }
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
