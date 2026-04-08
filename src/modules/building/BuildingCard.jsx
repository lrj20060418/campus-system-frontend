export default function BuildingCard({ building, onOpen }) {
  return (
    <button type="button" className="entity-card" onClick={() => onOpen?.(building)}>
      <strong>{building.building_name}</strong>
      <span className="muted">{building.building_type}</span>
    </button>
  )
}
