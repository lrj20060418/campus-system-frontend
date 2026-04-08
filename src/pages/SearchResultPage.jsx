import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { List, Spin } from 'antd'
import { searchKeywordsWithLog } from '../modules/query/api.js'
import { paths } from '../routes/paths.js'

export default function SearchResultPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const entity = params.get('entity') ?? 'all'
  return <SearchResultBody key={`${q}-${entity}`} q={q} entity={entity} />
}

function SearchResultBody({ q, entity }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    searchKeywordsWithLog({ q, entity }).then((data) => {
      if (!cancelled) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [q, entity])

  return (
    <div className="page">
      <h2>搜索结果</h2>
      <p className="muted">关键词：{q || '（空）'}</p>
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
