import { Tag } from 'antd'
import MarkdownContent from '../../components/MarkdownContent.jsx'

const QUERY_TYPE_LABEL = {
  keyword: '关键词',
  natural_language: '自然语言',
}

const ENTITY_SCOPE_LABEL = {
  all: '全部类型',
  campus: '校区',
  building: '建筑',
  facility: '设施',
  teacher: '教师',
  course: '课程',
  event: '活动',
}

function entityScopeLabel(scope) {
  const key = scope ?? 'all'
  return ENTITY_SCOPE_LABEL[key] ?? key
}

function formatTime(isoOrText) {
  if (!isoOrText) return ''
  const d = Date.parse(isoOrText)
  if (Number.isNaN(d)) return isoOrText
  return new Date(d).toLocaleString()
}

export default function QueryRecordItem({ record }) {
  const isNl = record.query_type === 'natural_language'
  const ok = record.status !== 'error'

  return (
    <div className="query-record-item">
      <div className="query-record-text">{record.query_text}</div>
      {isNl && record.answer ? (
        <div className="query-record-answer" style={{ marginTop: 8 }}>
          <MarkdownContent>{record.answer}</MarkdownContent>
        </div>
      ) : null}
      <div className="muted" style={{ marginTop: 4 }}>
        {isNl ? (
          formatTime(record.query_time)
        ) : (
          <>
            <Tag color={ok ? 'success' : 'error'}>{record.status ?? 'success'}</Tag>
            <span> · {QUERY_TYPE_LABEL[record.query_type] ?? record.query_type}</span>
            {record.entity_scope != null ? (
              <span>
                {' '}
                · 范围 <Tag>{entityScopeLabel(record.entity_scope)}</Tag>
              </span>
            ) : null}
            <span> · 命中 {record.result_count ?? 0} 条</span>
            <span> · {formatTime(record.query_time)}</span>
          </>
        )}
      </div>
    </div>
  )
}
