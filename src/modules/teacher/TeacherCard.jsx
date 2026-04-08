export default function TeacherCard({ teacher, onOpen }) {
  return (
    <button type="button" className="entity-card" onClick={() => onOpen?.(teacher)}>
      <strong>{teacher.teacher_name}</strong>
      <span className="muted">{teacher.department}</span>
    </button>
  )
}
