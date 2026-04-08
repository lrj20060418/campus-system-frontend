import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd'
import {
  listEvents,
  createEvent,
  updateEvent,
  removeEvent,
} from '../../modules/event/api.js'
import { listBuildings } from '../../modules/building/api.js'

const { TextArea } = Input

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

  async function onFinish(values) {
    try {
      if (editing) {
        await updateEvent(editing.event_id, values)
        message.success('已更新')
      } else {
        await createEvent(values)
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
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
          <Form.Item name="start_time" label="开始时间">
            <Input placeholder="如 2026-04-10 14:00" />
          </Form.Item>
          <Form.Item name="end_time" label="结束时间">
            <Input />
          </Form.Item>
          <Form.Item name="organizer" label="主办单位">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form>
      </Modal>
    </>
  )
}
