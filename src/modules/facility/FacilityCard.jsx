export default function FacilityCard({ facility, onOpen }) {
  return (
    <button type="button" className="entity-card" onClick={() => onOpen?.(facility)}>
      <strong>{facility.facility_name}</strong>
      <span className="muted">{facility.facility_type}</span>
    </button>
  )
}
