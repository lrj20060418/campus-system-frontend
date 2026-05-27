import { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Space, Table, message } from 'antd'
import {
  listCourses,
  createCourse,
  updateCourse,
  removeCourse,
} from '../../modules/course/api.js'
import { readNamedFieldsFromForm, isFormValidationError } from '../../lib/adminFormValues.js'
import { readEntityPrimaryId } from '../../lib/entityFilterDetail.js'

export default function CourseAdminTab() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const load = () => listCourses().then(setRows)

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
      credit: record.credit ?? undefined,
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
      const names = [
        'course_name',
        'course_id',
        'offering_department',
        'credit',
      ]
      const raw = readNamedFieldsFromForm(form, names)
      const payload = {
        course_name: String(raw.course_name ?? '').trim(),
        offering_department: String(raw.offering_department ?? ''),
        credit: raw.credit,
      }
      const cid = raw.course_id
      const cidStr = cid != null && String(cid).trim() !== '' ? String(cid).trim() : ''
      if (editing) {
        payload.course_id = cidStr || String(editing.course_id ?? '')
      } else if (cidStr) {
        payload.course_id = cidStr
      }
      if (editing) {
        await updateCourse(editing.course_id, payload)
        message.success('已更新')
      } else {
        await createCourse(payload)
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
      title: '确认删除该课程？',
      onOk: async () => {
        try {
          const cid = readEntityPrimaryId(record, 'course')
          if (!cid) {
            message.error('无法识别课程编号')
            return
          }
          await removeCourse(cid)
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
        新增课程
      </Button>
      <Table
        style={{ marginTop: 16 }}
        rowKey="course_id"
        dataSource={rows}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'course_id', width: 72 },
          { title: '课程名', dataIndex: 'course_name' },
          { title: '开课院系', dataIndex: 'offering_department' },
          { title: '学分', dataIndex: 'credit' },
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
        title={editing ? '编辑课程' : '新增课程'}
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
            name="course_name"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="course_id"
            label="课程编号"
            rules={[{ required: true, message: '请输入课程编号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="offering_department" label="开课院系">
            <Input />
          </Form.Item>
          <Form.Item name="credit" label="学分">
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="button" onClick={handleSubmit}>
            保存
          </Button>
        </Form>
      </Modal>
    </>
  )
}
