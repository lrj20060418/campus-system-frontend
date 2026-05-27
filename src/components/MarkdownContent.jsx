import ReactMarkdown from 'react-markdown'

/**
 * 渲染后端返回的 Markdown 文本（自然语言查询 answer 等）
 */
export default function MarkdownContent({ children, className = '' }) {
  const text = String(children ?? '').trim()
  if (!text) return null

  return (
    <div className={['markdown-content', className].filter(Boolean).join(' ')}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  )
}
