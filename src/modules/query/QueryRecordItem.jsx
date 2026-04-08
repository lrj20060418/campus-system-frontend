import { Tag } from 'antd'

function formatTime(isoOrText) {
  if (!isoOrText) return ''
  const d = Date.parse(isoOrText)
  if (Number.isNaN(d)) return isoOrText
  return new Date(d).toLocaleString()
}

export default function QueryRecordItem({ record }) {
  const ok = record.status === 'success'
  return (
    <div className="query-record-item">
      <div className="query-record-text">{record.query_text}</div>
      <div className="muted" style={{ marginTop: 4 }}>
        <Tag color={ok ? 'success' : 'error'}>{record.status ?? '—'}</Tag>
        <span> · {record.query_type}</span>
        <span> · 命中 {record.result_count ?? 0} 条</span>
        <span> · {formatTime(record.query_time)}</span>
      </div>
    </div>
  )
}
