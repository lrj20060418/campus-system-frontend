import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Space, Select } from 'antd'
import { paths } from '../routes/paths.js'
import { getApiBaseUrl } from '../lib/request.js'
import { TEACH_HOME_FILTER_FIELDS } from '../lib/teachKeys.js'

const ENTITY_OPTIONS_ALL = [
  { value: 'all', label: '全部' },
  { value: 'campus', label: '校区' },
  { value: 'building', label: '建筑' },
  { value: 'facility', label: '设施' },
  { value: 'teacher', label: '教师' },
  { value: 'course', label: '课程' },
  { value: 'event', label: '活动' },
  { value: 'teach', label: '授课' },
]

const BACKEND_ENTITY_OPTIONS = ENTITY_OPTIONS_ALL.filter((o) => o.value !== 'all')

const TEACH_FIELD_PLACEHOLDER = {
  teacher_name: '教师姓名，如 张老师',
  course_name: '课程名或课程编号，如 数据库',
  semester: '学期，如 2025-Fall',
}

export default function HomePage() {
  const useBackend = Boolean(getApiBaseUrl())
  const entityOptions = useMemo(
    () => (useBackend ? BACKEND_ENTITY_OPTIONS : ENTITY_OPTIONS_ALL),
    [useBackend],
  )

  const [q, setQ] = useState('')
  const [teachField, setTeachField] = useState('teacher_name')
  const navigate = useNavigate()
  const [entity, setEntity] = useState(useBackend ? 'campus' : 'all')

  const isTeach = entity === 'teach'

  function onSearch() {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (useBackend) {
      params.set('entity', entity)
    } else if (entity && entity !== 'all') {
      params.set('entity', entity)
    }
    if (isTeach) {
      params.set('teachField', teachField)
    }
    navigate(`${paths.search}?${params.toString()}`)
  }

  return (
    <div className="page home-page">
      <h1>复旦校园百事通</h1>
      <Space.Compact style={{ width: '100%', maxWidth: 860 }}>
        <Select
          value={entity}
          onChange={setEntity}
          style={{ width: 112 }}
          options={entityOptions}
        />
        {isTeach ? (
          <Select
            value={teachField}
            onChange={setTeachField}
            style={{ width: 112 }}
            options={TEACH_HOME_FILTER_FIELDS}
          />
        ) : null}
        <Input
          style={{ flex: 1, minWidth: 0 }}
          placeholder={
            isTeach
              ? TEACH_FIELD_PLACEHOLDER[teachField] ?? '请输入关键词'
              : useBackend
                ? '例如：邯郸校区'
                : '例如：食堂、数据库、教师姓名'
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
