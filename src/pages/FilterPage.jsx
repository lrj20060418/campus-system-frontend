import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  List,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
} from 'antd'
import {
  FILTER_ENTITY_OPTIONS,
  getFilterSchema,
} from '../config/entityFilterSchemas.js'
import {
  postEntityAdvancedFilter,
  prepareAdvancedFilterRequest,
} from '../lib/entityAdvancedFilter.js'
import { loadFilterFieldOptions } from '../lib/entityFilterOptions.js'
import { formatApiError } from '../lib/request.js'
import { paths } from '../routes/paths.js'

function FilterFieldControl({ field, value, onChange, id, selectOptions, optionsLoading }) {
  const placeholder =
    field.placeholder ??
    (field.type === 'idList' || field.type === 'tagList'
      ? '多个值用逗号分隔或回车添加'
      : undefined)

  if (field.type === 'select') {
    return (
      <Select
        id={id}
        value={value}
        onChange={onChange}
        allowClear
        placeholder="请选择"
        options={field.options}
        style={{ width: '100%' }}
      />
    )
  }

  if (field.type === 'idList') {
    const options = selectOptions ?? field.options ?? []
    return (
      <Select
        id={id}
        mode="multiple"
        value={value}
        onChange={onChange}
        allowClear
        showSearch
        optionFilterProp="label"
        optionLabelProp="label"
        loading={optionsLoading}
        options={options}
        placeholder={placeholder ?? '请选择，可多选'}
        notFoundContent={optionsLoading ? '加载候选项…' : '暂无候选项'}
        style={{ width: '100%' }}
      />
    )
  }

  const tagSelectTypes = field.type === 'tagList' || (field.type === 'text' && field.asList)

  if (tagSelectTypes) {
    const options = selectOptions ?? field.options ?? []
    return (
      <Select
        id={id}
        mode="tags"
        value={value}
        onChange={onChange}
        allowClear
        showSearch
        optionFilterProp="label"
        loading={optionsLoading}
        options={options}
        tokenSeparators={[',', '，', ' ']}
        placeholder={placeholder}
        notFoundContent={optionsLoading ? '加载候选项…' : '无匹配项，可直接输入'}
        style={{ width: '100%' }}
      />
    )
  }

  if (field.type === 'text' && !field.asList && (selectOptions?.length ?? 0) > 0) {
    return (
      <Select
        id={id}
        value={value}
        onChange={onChange}
        allowClear
        showSearch
        optionFilterProp="label"
        loading={optionsLoading}
        options={selectOptions}
        placeholder={placeholder ?? '请选择或输入'}
        notFoundContent={optionsLoading ? '加载候选项…' : '无匹配项'}
        style={{ width: '100%' }}
      />
    )
  }

  if (field.type === 'number') {
    return (
      <InputNumber
        id={id}
        value={value}
        onChange={onChange}
        style={{ width: '100%' }}
        placeholder={placeholder}
      />
    )
  }

  return (
    <Input
      id={id}
      value={value}
      onChange={onChange}
      allowClear
      placeholder={placeholder ?? '请输入'}
    />
  )
}

function EntityFilterPanel({ entity }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [fieldOptions, setFieldOptions] = useState({})
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [optionsError, setOptionsError] = useState('')
  const [lastBody, setLastBody] = useState(null)

  const fields = useMemo(() => getFilterSchema(entity), [entity])

  useEffect(() => {
    let cancelled = false
    setOptionsLoading(true)
    setOptionsError('')
    loadFilterFieldOptions(entity)
      .then((opts) => {
        if (!cancelled) setFieldOptions(opts)
      })
      .catch((e) => {
        if (!cancelled) {
          setFieldOptions({})
          setOptionsError(formatApiError(e))
        }
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [entity])

  async function onFinish(values) {
    setError('')
    setLoading(true)
    try {
      const { body } = prepareAdvancedFilterRequest(entity, values, fieldOptions)
      setLastBody(body)
      if (Object.keys(body).length === 0) {
        setError('请至少填写一个筛选条件')
        setItems([])
        setLoading(false)
        return
      }
      const data = await postEntityAdvancedFilter(entity, values, fieldOptions)
      setItems(data)
    } catch (e) {
      setError(formatApiError(e) || '筛选失败')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function onReset() {
    form.resetFields()
    setItems([])
    setError('')
    setLastBody(null)
  }

  return (
    <div className="entity-filter-panel">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[12, 0]} className="filter-fields-row">
          {fields.map((field) => (
            <Col key={field.name} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Form.Item name={field.name} label={field.label}>
                <FilterFieldControl
                  field={field}
                  selectOptions={fieldOptions[field.name]}
                  optionsLoading={optionsLoading}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            查询
          </Button>
          <Button onClick={onReset}>重置</Button>
        </Space>
      </Form>


      

      {optionsError ? (
        <Alert
          type="warning"
          title={`候选项加载失败：${optionsError}，仍可手动输入`}
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {error ? (
        <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <Spin spinning={loading}>
        <List
          dataSource={items}
          locale={{ emptyText: loading ? '查询中…' : '暂无结果' }}
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

export default function FilterPage() {
  const [entity, setEntity] = useState('course')

  const tabItems = FILTER_ENTITY_OPTIONS.map((opt) => ({
    key: opt.value,
    label: opt.label,
    children: <EntityFilterPanel entity={opt.value} />,
  }))

  return (
    <div className="page filter-page">
      <h2>筛选</h2>
      <Tabs
        activeKey={entity}
        onChange={setEntity}
        items={tabItems}
        destroyInactiveTabPane
      />
    </div>
  )
}
