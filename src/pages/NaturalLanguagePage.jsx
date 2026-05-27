import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Input, List, Modal, Spin, message } from 'antd'
import { naturalLanguageQuery } from '../modules/query/nlQueryApi.js'
import {
  listMyNlQueryRecords,
  removeQueryRecord,
} from '../modules/query/queryRecordApi.js'
import QueryRecordItem from '../modules/query/QueryRecordItem.jsx'
import MarkdownContent from '../components/MarkdownContent.jsx'
import { paths } from '../routes/paths.js'

export default function NaturalLanguagePage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [querying, setQuerying] = useState(false)
  const [queryError, setQueryError] = useState('')

  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(true)

  const loadRecords = useCallback(() => {
    setRecordsLoading(true)
    return listMyNlQueryRecords()
      .then(setRecords)
      .catch((e) => {
        message.error(e.message ?? '加载查询记录失败')
        setRecords([])
      })
      .finally(() => setRecordsLoading(false))
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  async function onAsk() {
    setQueryError('')
    setAnswer('')
    setQuerying(true)
    try {
      const result = await naturalLanguageQuery(question)
      setAnswer(result.answer ?? '')
      await loadRecords()
    } catch (e) {
      setQueryError(e.message ?? '查询失败')
    } finally {
      setQuerying(false)
    }
  }

  function onDeleteRecord(record) {
    const id = record.record_id ?? record.id
    Modal.confirm({
      title: '删除这条查询记录？',
      content: record.query_text,
      okType: 'danger',
      onOk: async () => {
        try {
          await removeQueryRecord(id)
          message.success('已删除')
          await loadRecords()
        } catch (e) {
          message.error(e.message ?? '删除失败')
        }
      },
    })
  }

  return (
    <div className="page">
      <p>
        <Link to={paths.home}>返回首页</Link>
        {' · '}
        <Link to={paths.me}>我的账户</Link>
      </p>

      <h2>自然语言查询</h2>
    

      <Input.TextArea
        rows={3}
        placeholder="例如：邯郸校区有哪些教学楼"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxLength={500}
        showCount
      />
      <Button
        type="primary"
        loading={querying}
        onClick={onAsk}
        style={{ marginTop: 12 }}
        disabled={!question.trim()}
      >
        提问
      </Button>

      {queryError ? (
        <Alert type="error" title={queryError} showIcon style={{ marginTop: 16 }} />
      ) : null}

      <Spin spinning={querying}>
        {answer ? (
          <div className="nl-answer">
            <MarkdownContent>{answer}</MarkdownContent>
          </div>
        ) : null}
      </Spin>

      <h3 style={{ marginTop: 32 }}>我的查询记录</h3>
      <Spin spinning={recordsLoading}>
        <List
          dataSource={records}
          locale={{ emptyText: '暂无记录' }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="delete"
                  type="link"
                  danger
                  size="small"
                  onClick={() => onDeleteRecord(item)}
                >
                  删除
                </Button>,
              ]}
            >
              <QueryRecordItem record={item} />
            </List.Item>
          )}
        />
      </Spin>
    </div>
  )
}
