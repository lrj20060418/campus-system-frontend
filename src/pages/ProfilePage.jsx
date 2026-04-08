import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { List, Spin } from 'antd'
import { listQueryRecords } from '../modules/query/api.js'
import QueryRecordItem from '../modules/query/QueryRecordItem.jsx'
import { paths } from '../routes/paths.js'

export default function ProfilePage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listQueryRecords().then((rows) => {
      setRecords(rows)
      setLoading(false)
    })
  }, [])

  return (
    <div className="page">
      <p>
        <Link to={paths.home}>返回首页</Link>
      </p>
      <h2>我的查询记录</h2>
      <Spin spinning={loading}>
        <List
          dataSource={records}
          locale={{ emptyText: '暂无记录' }}
          renderItem={(item) => (
            <List.Item>
              <QueryRecordItem record={item} />
            </List.Item>
          )}
        />
      </Spin>
    </div>
  )
}
