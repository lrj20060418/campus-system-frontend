import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, List, Spin } from 'antd'
import { searchKeywordsWithLog } from '../modules/query/api.js'
import { paths } from '../routes/paths.js'
import { getApiBaseUrl } from '../lib/request.js'

export default function SearchResultPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const entity = params.get('entity') ?? 'all'
  return <SearchResultBody key={`${q}-${entity}`} q={q} entity={entity} />
}

function SearchResultBody({ q, entity }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const useBackend = Boolean(getApiBaseUrl())

  useEffect(() => {
    let cancelled = false
    setError('')
    setLoading(true)
    searchKeywordsWithLog({ q, entity })
      .then((data) => {
        if (!cancelled) {
          setItems(data)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message ?? '请求失败')
          setItems([])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [q, entity])

  const needEntityHint =
    useBackend && (entity === 'all' || !entity)

  return (
    <div className="page">
      <h2>搜索结果</h2>
      <p className="muted">
        关键词：{q || '（空）'}
        {entity && entity !== 'all' ? ` · 类型：${entity}` : null}
      </p>
      {needEntityHint ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="已连接后端时，请先在首页选择具体类型（如校区），再搜索。"
        />
      ) : null}
      {error ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <Spin spinning={loading}>
        <List
          dataSource={items}
          locale={{ emptyText: '暂无结果' }}
          renderItem={(item) => (
            <List.Item>
              <Link to={paths.detail(item.entity, item.id)}>
                [{item.entity}] {item.title}
              </Link>
              <span className="muted"> — {item.subtitle}</span>
            </List.Item>
          )}
        />
      </Spin>
    </div>
  )
}
