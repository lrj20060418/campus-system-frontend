export default function QueryRecordItem({ record }) {
  return (
    <div className="query-record-item">
      <div className="query-record-text">{record.query_text}</div>
      <div className="muted">
        {record.query_time} · {record.query_type}
      </div>
    </div>
  )
}
