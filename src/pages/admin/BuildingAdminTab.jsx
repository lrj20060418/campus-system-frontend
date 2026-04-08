import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd'
import {
  listBuildings,
  createBuilding,
  updateBuilding,
  removeBuilding,
} from '../../modules/building/api.js'
import { listCampuses } from '../../modules/campus/api.js'

export default function BuildingAdminTab() {
  const [rows, setRows] = useState([])
  const [campusOptions, setCampusOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const campusMap = useMemo(() => {
    const m = new Map()
    campusOptions.forEach((c) => m.set(c.campus_id, c.campus_name))
    return m
  }, [campusOptions])

  const load = async () => {
    const [bs, cs] = await Promise.all([listBuildings(), listCampuses()])
    setRows(bs)
    setCampusOptions(cs)
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
        await updateBuilding(editing.building_id, values)
        message.success('已更新')
      } else {
        await createBuilding(values)
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
      title: '确认删除该建筑？',
      content: '若仍有设施或活动关联该建筑，删除会被拒绝。',
      onOk: async () => {
        try {
          await removeBuilding(record.building_id)
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
        新增建筑
      </Button>
      <Table
        style={{ marginTop: 16 }}
        rowKey="building_id"
        dataSource={rows}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'building_id', width: 72 },
          {
            title: '校区',
            dataIndex: 'campus_id',
            render: (id) => campusMap.get(id) ?? id,
          },
          { title: '名称', dataIndex: 'building_name' },
          { title: '类型', dataIndex: 'building_type' },
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
        title={editing ? '编辑建筑' : '新增建筑'}
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
            name="campus_id"
            label="所属校区"
            rules={[{ required: true, message: '请选择校区' }]}
          >
            <Select
              options={campusOptions.map((c) => ({
                value: c.campus_id,
                label: c.campus_name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="building_name"
            label="建筑名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="building_type"
            label="建筑类型"
            rules={[{ required: true, message: '请输入类型' }]}
          >
            <Input placeholder="如：教学楼、宿舍、餐饮" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form>
      </Modal>
    </>
  )
}
