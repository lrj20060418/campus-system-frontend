import { Tabs, Typography } from 'antd'
import CampusAdminTab from './admin/CampusAdminTab.jsx'
import BuildingAdminTab from './admin/BuildingAdminTab.jsx'
import FacilityAdminTab from './admin/FacilityAdminTab.jsx'
import TeacherAdminTab from './admin/TeacherAdminTab.jsx'
import CourseAdminTab from './admin/CourseAdminTab.jsx'
import EventAdminTab from './admin/EventAdminTab.jsx'
import TeachAdminTab from './admin/TeachAdminTab.jsx'

const { Text } = Typography

export default function AdminPage() {
  return (
    <div className="page">
      <h2>管理后台</h2>
      <Tabs
        style={{ marginTop: 16 }}
        items={[
          { key: 'campus', label: '校区', children: <CampusAdminTab /> },
          { key: 'building', label: '建筑', children: <BuildingAdminTab /> },
          { key: 'facility', label: '设施', children: <FacilityAdminTab /> },
          { key: 'teacher', label: '教师', children: <TeacherAdminTab /> },
          { key: 'course', label: '课程', children: <CourseAdminTab /> },
          { key: 'event', label: '活动', children: <EventAdminTab /> },
          { key: 'teach', label: '授课', children: <TeachAdminTab /> },
        ]}
      />
    </div>
  )
}
