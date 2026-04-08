export default function CourseCard({ course, onOpen }) {
  return (
    <button type="button" className="entity-card" onClick={() => onOpen?.(course)}>
      <strong>{course.course_name}</strong>
      <span className="muted">{course.offering_department}</span>
    </button>
  )
}
