import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd'
import {
  listEvents,
  createEvent,
  updateEvent,
  removeEvent,
} from '../../modules/event/api.js'
import { listBuildings } from '../../modules/building/api.js'
import { readNamedFieldsFromForm, isFormValidationError } from '../../lib/adminFormValues.js'

const { TextArea } = Input

/** 后端要求合法 datetime，避免空串或过短 */
function datetimeRules(label) {
  return [
    { required: true, message: `请填写${label}` },
    {
      validator(_, value) {
        const s = String(value ?? '').trim()
        if (!s) return Promise.reject(new Error(`请填写${label}`))
        if (s.length < 10) {
          return Promise.reject(
            new Error(`${label}格式不完整，请使用如 2026-04-10 15:00:00 或 ISO 格式`),
          )
        }
        return Promise.resolve()
      },
    },
  ]
}

export default function EventAdminTab() {
  const [rows, setRows] = useState([])
  const [buildingOptions, setBuildingOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const buildingMap = useMemo(() => {
    const m = new Map()
    buildingOptions.forEach((b) => m.set(b.building_id, b.building_name))
    return m
  }, [buildingOptions])

  const load = async () => {
    const [es, bs] = await Promise.all([listEvents(), listBuildings()])
    setRows(es)
    setBuildingOptions(bs)
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  function openEdit(record) {
    setEditing(record)
    form.setFieldsValue(record)
    setOpen(true)
  }

  async function handleSubmit() {
    try {
      await form.validateFields()
    } catch (e) {
      if (isFormValidationError(e)) return
      message.error(e?.message ?? '校验失败')
      return
    }
    try {
      const raw = readNamedFieldsFromForm(form, [
        'building_id',
        'event_name',
        'start_time',
        'end_time',
        'organizer',
        'description',
      ])
      const payload = {
        building_id: Number(raw.building_id),
        event_name: String(raw.event_name ?? '').trim(),
        start_time: String(raw.start_time ?? '').trim(),
        end_time: String(raw.end_time ?? '').trim(),
        organizer: String(raw.organizer ?? ''),
        description: String(raw.description ?? ''),
      }
      if (editing) {
        await updateEvent(editing.event_id, payload)
        message.success('已更新')
      } else {
        await createEvent(payload)
        message.success('已创建')
      }
      setOpen(false)
      setEditing(null)
      form.resetFields()
      load()
    } catch (e) {
      message.error(e.message ?? '保存失败')
    }
  }

  function onDelete(record) {
    Modal.confirm({
      title: '确认删除该活动？',
      onOk: async () => {
        try {
          await removeEvent(record.event_id)
          message.success('已删除')
          load()
        } catch (e) {
          message.error(e.message ?? '删除失败')
        }
      },
    })
  }

  return (
    <>
      <Button type="primary" onClick={openCreate}>
        新增活动
      </Button>
      <Table
        style={{ marginTop: 16 }}
        rowKey="event_id"
        dataSource={rows}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'event_id', width: 72 },
          {
            title: '建筑',
            dataIndex: 'building_id',
            render: (id) => buildingMap.get(id) ?? id,
          },
          { title: '活动名', dataIndex: 'event_name' },
          { title: '开始', dataIndex: 'start_time' },
          { title: '结束', dataIndex: 'end_time' },
          { title: '主办', dataIndex: 'organizer' },
          {
            title: '操作',
            key: 'actions',
            width: 160,
            render: (_, r) => (
              <Space>
                <Button size="small" onClick={() => openEdit(r)}>
                  编辑
                </Button>
                <Button size="small" danger onClick={() => onDelete(r)}>
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '编辑活动' : '新增活动'}
        open={open}
        onCancel={() => {
          setOpen(false)
          setEditing(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="building_id"
            label="举办建筑"
            rules={[{ required: true, message: '请选择建筑' }]}
          >
            <Select
              options={buildingOptions.map((b) => ({
                value: b.building_id,
                label: b.building_name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="event_name"
            label="活动名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="start_time" label="开始时间" rules={datetimeRules('开始时间')}>
            <Input placeholder="如 2026-04-10 15:00:00（须可被后端解析为日期时间）" />
          </Form.Item>
          <Form.Item name="end_time" label="结束时间" rules={datetimeRules('结束时间')}>
            <Input placeholder="如 2026-04-10 17:00:00" />
          </Form.Item>
          <Form.Item name="organizer" label="主办单位">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="button" onClick={handleSubmit}>
            保存
          </Button>
        </Form>
      </Modal>
    </>
  )
}
