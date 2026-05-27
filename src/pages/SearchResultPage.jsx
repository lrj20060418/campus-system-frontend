import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, List, Spin } from 'antd'
import { searchKeywordsWithLog } from '../modules/query/api.js'
import { paths } from '../routes/paths.js'
import { getApiBaseUrl } from '../lib/request.js'
import { TEACH_HOME_FILTER_FIELDS } from '../lib/teachKeys.js'

export default function SearchResultPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const entity = params.get('entity') ?? 'all'
  const teachField = params.get('teachField') ?? 'teacher_name'
  return (
    <SearchResultBody
      key={`${q}-${entity}-${teachField}`}
      q={q}
      entity={entity}
      teachField={teachField}
    />
  )
}

function SearchResultBody({ q, entity, teachField }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const useBackend = Boolean(getApiBaseUrl())

  useEffect(() => {
    let cancelled = false
    setError('')
    setLoading(true)
    searchKeywordsWithLog({ q, entity, teachField })
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
  }, [q, entity, teachField])

  const teachFieldLabel =
    entity === 'teach'
      ? TEACH_HOME_FILTER_FIELDS.find((o) => o.value === teachField)?.label
      : null

  const needEntityHint =
    useBackend && (entity === 'all' || !entity)

  return (
    <div className="page">
      <h2>搜索结果</h2>
      <p className="muted">
        关键词：{q || '（空）'}
        {entity && entity !== 'all' ? ` · 类型：${entity}` : null}
        {teachFieldLabel ? ` · 按${teachFieldLabel}` : null}
      </p>
      {needEntityHint ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title="请先在首页选择具体类型（如校区），再搜索。"
        />
      ) : null}
      {error ? (
        <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />
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
