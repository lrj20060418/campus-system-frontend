export default function EventCard({ event: ev, onOpen }) {
  return (
    <button type="button" className="entity-card" onClick={() => onOpen?.(ev)}>
      <strong>{ev.event_name}</strong>
      <span className="muted">{ev.start_time}</span>
    </button>
  )
}
