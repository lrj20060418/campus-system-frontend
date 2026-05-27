import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Descriptions, Spin } from 'antd'
import { getCampus } from '../modules/campus/api.js'
import { getBuilding } from '../modules/building/api.js'
import { getFacility } from '../modules/facility/api.js'
import { getTeacher } from '../modules/teacher/api.js'
import { getCourse } from '../modules/course/api.js'
import { getEvent } from '../modules/event/api.js'
import CampusTag from '../modules/campus/CampusTag.jsx'
import { paths } from '../routes/paths.js'

function formatDateTime(v) {
  if (v == null || v === '') return '—'
  const t = Date.parse(v)
  if (Number.isNaN(t)) return String(v)
  return new Date(t).toLocaleString()
}

async function loadDetail(entity, id) {
  switch (entity) {
    case 'campus':
      return getCampus(id)
    case 'building':
      return getBuilding(id)
    case 'facility':
      return getFacility(id)
    case 'teacher':
      return getTeacher(id)
    case 'course':
      return getCourse(id)
    case 'event':
      return getEvent(id)
    default:
      return null
  }
}

export default function DetailPage() {
  const { entity, id } = useParams()
  return <DetailBody key={`${entity}-${id}`} entity={entity} id={id} />
}

function DetailBody({ entity, id }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    setLoading(true)
    loadDetail(entity, id)
      .then((row) => {
        if (!cancelled) {
          setData(row)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message ?? '加载失败')
          setData(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [entity, id])

  if (!['campus', 'building', 'facility', 'teacher', 'course', 'event'].includes(entity)) {
    return <p>未知类型：{entity}</p>
  }

  return (
    <div className="page">
      <p>
        <Link to={paths.home}>返回首页</Link>
      </p>
      <h2>详情</h2>
      {error ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <Spin spinning={loading}>
        {!data && !loading && <p>未找到数据</p>}
        {data && (
          <>
            {entity === 'campus' && (
              <>
                <CampusTag name={data.campus_name} />
                <Descriptions column={1} style={{ marginTop: 16 }}>
                  <Descriptions.Item label="地址">
                    {data.address ?? '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {formatDateTime(data.create_time)}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {formatDateTime(data.update_time)}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
            {entity === 'building' && (
              <Descriptions column={1}>
                <Descriptions.Item label="名称">{data.building_name}</Descriptions.Item>
                <Descriptions.Item label="类型">{data.building_type}</Descriptions.Item>
                <Descriptions.Item label="校区ID">{data.campus_id}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatDateTime(data.create_time)}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {formatDateTime(data.update_time)}
                </Descriptions.Item>
              </Descriptions>
            )}
            {entity === 'facility' && (
              <Descriptions column={1}>
                <Descriptions.Item label="名称">{data.facility_name}</Descriptions.Item>
                <Descriptions.Item label="类型">{data.facility_type}</Descriptions.Item>
                <Descriptions.Item label="开放时间">{data.open_time ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="楼层">{data.floor ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="建筑ID">{data.building_id}</Descriptions.Item>
              </Descriptions>
            )}
            {entity === 'teacher' && (
              <Descriptions column={1}>
                <Descriptions.Item label="姓名">{data.teacher_name}</Descriptions.Item>
                <Descriptions.Item label="院系">{data.department ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{data.email ?? '—'}</Descriptions.Item>
              </Descriptions>
            )}
            {entity === 'course' && (
              <Descriptions column={1}>
                <Descriptions.Item label="课程名">{data.course_name}</Descriptions.Item>
                <Descriptions.Item label="开课院系">
                  {data.offering_department ?? '—'}
                </Descriptions.Item>
                <Descriptions.Item label="学期">{data.semester ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="学分">
                  {data.credit != null ? data.credit : '—'}
                </Descriptions.Item>
              </Descriptions>
            )}
            {entity === 'event' && (
              <Descriptions column={1}>
                <Descriptions.Item label="活动">{data.event_name}</Descriptions.Item>
                <Descriptions.Item label="开始时间">{data.start_time ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="结束时间">{data.end_time ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="主办">{data.organizer ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="建筑ID">{data.building_id}</Descriptions.Item>
                <Descriptions.Item label="说明">{data.description ?? '—'}</Descriptions.Item>
              </Descriptions>
            )}
          </>
        )}
      </Spin>
    </div>
  )
}
