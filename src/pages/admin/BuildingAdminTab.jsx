import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd'
import {
  listBuildings,
  createBuilding,
  updateBuilding,
  removeBuilding,
} from '../../modules/building/api.js'
import { listCampuses } from '../../modules/campus/api.js'
import { readNamedFieldsFromForm, isFormValidationError } from '../../lib/adminFormValues.js'

/** 与后端 building_type 枚举一致 */
const BUILDING_TYPE_OPTIONS = [
  { value: '教学楼', label: '教学楼' },
  { value: '宿舍楼', label: '宿舍楼' },
  { value: '办公楼', label: '办公楼' },
  { value: '实验楼', label: '实验楼' },
  { value: '体育馆', label: '体育馆' },
  { value: '食堂', label: '食堂' },
  { value: '图书馆', label: '图书馆' },
  { value: '其他', label: '其他' },
]

const BUILDING_TYPE_SET = new Set(BUILDING_TYPE_OPTIONS.map((o) => o.value))

function normalizeBuildingTypeForForm(raw) {
  let t = String(raw ?? '').trim()
  if (t === '办公') t = '办公楼'
  if (BUILDING_TYPE_SET.has(t)) return t
  return undefined
}

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
    form.setFieldsValue({
      ...record,
      building_type: normalizeBuildingTypeForForm(record.building_type),
    })
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
      const raw = readNamedFieldsFromForm(form, ['campus_id', 'building_name', 'building_type'])
      const payload = {
        campus_id: Number(raw.campus_id),
        building_name: String(raw.building_name ?? '').trim(),
        building_type: raw.building_type,
      }
      if (editing) {
        await updateBuilding(editing.building_id, payload)
        message.success('已更新')
      } else {
        await createBuilding(payload)
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
      >
        <Form form={form} layout="vertical">
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
            rules={[{ required: true, message: '请选择建筑类型' }]}
          >
            <Select placeholder="请选择" options={BUILDING_TYPE_OPTIONS} />
          </Form.Item>
          <Button type="primary" htmlType="button" onClick={handleSubmit}>
            保存
          </Button>
        </Form>
      </Modal>
    </>
  )
}
