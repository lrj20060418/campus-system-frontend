import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd'
import {
  listFacilities,
  createFacility,
  updateFacility,
  removeFacility,
} from '../../modules/facility/api.js'
import { listBuildings } from '../../modules/building/api.js'
import { readNamedFieldsFromForm, isFormValidationError } from '../../lib/adminFormValues.js'

export default function FacilityAdminTab() {
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
    const [fs, bs] = await Promise.all([listFacilities(), listBuildings()])
    setRows(fs)
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
    form.setFieldsValue({
      ...record,
      open_time: record.open_time ?? record.openTime ?? '',
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
      const raw = readNamedFieldsFromForm(form, [
        'building_id',
        'facility_name',
        'facility_type',
        'open_time',
      ])
      const payload = {
        building_id: Number(raw.building_id),
        facility_name: String(raw.facility_name ?? '').trim(),
        facility_type: String(raw.facility_type ?? '').trim(),
        open_time: String(raw.open_time ?? ''),
      }
      if (editing) {
        await updateFacility(editing.facility_id, payload)
        message.success('已更新')
      } else {
        await createFacility(payload)
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
      title: '确认删除该设施？',
      onOk: async () => {
        try {
          await removeFacility(record.facility_id)
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
        新增设施
      </Button>
      <Table
        style={{ marginTop: 16 }}
        rowKey="facility_id"
        dataSource={rows}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'facility_id', width: 72 },
          {
            title: '建筑',
            dataIndex: 'building_id',
            render: (id) => buildingMap.get(id) ?? id,
          },
          { title: '名称', dataIndex: 'facility_name' },
          { title: '类型', dataIndex: 'facility_type' },
          { title: '开放时间', dataIndex: 'open_time' },
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
        title={editing ? '编辑设施' : '新增设施'}
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
            label="所属建筑"
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
            name="facility_name"
            label="设施名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="facility_type"
            label="设施类型"
            rules={[{ required: true, message: '请输入类型' }]}
          >
            <Input placeholder="如：食堂、图书馆" />
          </Form.Item>
          <Form.Item name="open_time" label="开放时间">
            <Input placeholder="如：06:30–22:00" />
          </Form.Item>
          <Button type="primary" htmlType="button" onClick={handleSubmit}>
            保存
          </Button>
        </Form>
      </Modal>
    </>
  )
}
