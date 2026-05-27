import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd'
import {
  listTeaches,
  createTeach,
  updateTeach,
  removeTeach,
  formatTeachRouteId,
} from '../../modules/teach/api.js'
import { listTeachers } from '../../modules/teacher/api.js'
import { listCourses } from '../../modules/course/api.js'
import { readNamedFieldsFromForm, isFormValidationError } from '../../lib/adminFormValues.js'

const TEACH_ROLE_OPTIONS = [
  { value: '教师', label: '教师' },
  { value: '助教', label: '助教' },
]

function datetimeRules(label) {
  return [
    { required: true, message: `请填写${label}` },
    {
      validator(_, value) {
        const s = String(value ?? '').trim()
        if (!s) return Promise.reject(new Error(`请填写${label}`))
        if (s.length < 10) {
          return Promise.reject(
            new Error(`${label}格式不完整，请使用如 2025-09-08 08:00:00`),
          )
        }
        return Promise.resolve()
      },
    },
  ]
}

export default function TeachAdminTab() {
  const [rows, setRows] = useState([])
  const [teacherOptions, setTeacherOptions] = useState([])
  const [courseOptions, setCourseOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const teacherMap = useMemo(() => {
    const m = new Map()
    teacherOptions.forEach((t) => m.set(t.teacher_id, t.teacher_name))
    return m
  }, [teacherOptions])

  const load = async () => {
    const [ts, teachers, courses] = await Promise.all([
      listTeaches(),
      listTeachers(),
      listCourses(),
    ])
    setRows(ts)
    setTeacherOptions(teachers)
    setCourseOptions(courses)
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
        'teacher_id',
        'course_id',
        'semester',
        'section_no',
        'teach_role',
        'start_time',
        'end_time',
      ])
      const payload = {
        teacher_id: Number(raw.teacher_id),
        course_id: String(raw.course_id ?? '').trim(),
        semester: String(raw.semester ?? '').trim(),
        section_no: String(raw.section_no ?? '').trim(),
        teach_role: String(raw.teach_role ?? '').trim(),
        start_time: String(raw.start_time ?? '').trim(),
        end_time: String(raw.end_time ?? '').trim(),
      }
      if (editing) {
        await updateTeach(formatTeachRouteId(editing), payload)
        message.success('已更新')
      } else {
        await createTeach(payload)
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
      title: '确认删除该授课记录？',
      content: `${record.course_id} · ${record.semester} · 班${record.section_no}`,
      onOk: async () => {
        try {
          await removeTeach(formatTeachRouteId(record))
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
        新增授课
      </Button>
      <Table
        style={{ marginTop: 16 }}
        rowKey={(r) => formatTeachRouteId(r)}
        dataSource={rows}
        scroll={{ x: 960 }}
        pagination={false}
        columns={[
          { title: '教师', dataIndex: 'teacher_id', render: (id) => teacherMap.get(id) ?? id },
          { title: '课程编号', dataIndex: 'course_id', width: 100 },
          { title: '学期', dataIndex: 'semester', width: 110 },
          { title: '班次', dataIndex: 'section_no', width: 72 },
          { title: '角色', dataIndex: 'teach_role', width: 80 },
          { title: '开始', dataIndex: 'start_time', width: 160 },
          { title: '结束', dataIndex: 'end_time', width: 160 },
          {
            title: '操作',
            key: 'actions',
            width: 160,
            fixed: 'right',
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
        title={editing ? '编辑授课' : '新增授课'}
        open={open}
        width={520}
        onCancel={() => {
          setOpen(false)
          setEditing(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="teacher_id"
            label="教师"
            rules={[{ required: true, message: '请选择教师' }]}
          >
            <Select
              disabled={Boolean(editing)}
              options={teacherOptions.map((t) => ({
                value: t.teacher_id,
                label: t.teacher_name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="course_id"
            label="课程编号"
            rules={[{ required: true, message: '请选择或填写课程编号' }]}
          >
            <Select
              disabled={Boolean(editing)}
              showSearch
              optionFilterProp="label"
              options={courseOptions.map((c) => ({
                value: String(c.course_id),
                label: `${c.course_id} · ${c.course_name}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="semester"
            label="学期"
            rules={[{ required: true, message: '请输入学期' }]}
          >
            <Input disabled={Boolean(editing)} placeholder="如 2025-Fall" />
          </Form.Item>
          <Form.Item
            name="section_no"
            label="班次"
            rules={[{ required: true, message: '请输入班次' }]}
          >
            <Input disabled={Boolean(editing)} placeholder="如 01" />
          </Form.Item>
          <Form.Item
            name="teach_role"
            label="授课角色"
            rules={[{ required: true, message: '请选择授课角色' }]}
          >
            <Select options={TEACH_ROLE_OPTIONS} placeholder="请选择" />
          </Form.Item>
          <Form.Item
            name="start_time"
            label="开始时间"
            rules={datetimeRules('开始时间')}
          >
            <Input placeholder="2025-09-08 08:00:00" />
          </Form.Item>
          <Form.Item
            name="end_time"
            label="结束时间"
            rules={datetimeRules('结束时间')}
          >
            <Input placeholder="2026-01-12 18:00:00" />
          </Form.Item>
          <Button type="primary" htmlType="button" onClick={handleSubmit}>
            保存
          </Button>
        </Form>
      </Modal>
    </>
  )
}
