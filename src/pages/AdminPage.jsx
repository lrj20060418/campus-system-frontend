import { useEffect, useState } from 'react'
import { Card, Col, Row, Typography } from 'antd'
import { listCampuses } from '../modules/campus/api.js'
import { listBuildings } from '../modules/building/api.js'
import { listFacilities } from '../modules/facility/api.js'
import { listTeachers } from '../modules/teacher/api.js'
import { listCourses } from '../modules/course/api.js'
import { listEvents } from '../modules/event/api.js'

const { Text } = Typography

const modules = [
  { key: 'campus', title: 'campus', label: '校区', load: listCampuses },
  { key: 'building', title: 'building', label: '建筑', load: listBuildings },
  { key: 'facility', title: 'facility', label: '设施', load: listFacilities },
  { key: 'teacher', title: 'teacher', label: '教师', load: listTeachers },
  { key: 'course', title: 'course', label: '课程', load: listCourses },
  { key: 'event', title: 'event', label: '活动', load: listEvents },
]

/** 占位：展示各模块 list 条数，后续可替换为 CRUD 表格 */
export default function AdminPage() {
  return (
    <div className="page">
      <h2>管理后台（mock）</h2>
      <Text type="secondary">各业务模块数据条数占位，CRUD 表单可在此扩展。</Text>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {modules.map((m) => (
          <Col xs={24} md={12} lg={8} key={m.key}>
            <Card title={m.title} size="small">
              <MockCount load={m.load} label={m.label} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

function MockCount({ load, label }) {
  const [n, setN] = useState('…')

  useEffect(() => {
    load().then((rows) => setN(rows.length))
  }, [load])

  return (
    <Text>
      当前 mock {label} 条数：<strong>{n}</strong>
    </Text>
  )
}
