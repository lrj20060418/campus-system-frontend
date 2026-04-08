import { events } from '../../mock/data.js'

export function listEvents() {
  return Promise.resolve([...events])
}

export function getEvent(eventId) {
  const id = Number(eventId)
  return Promise.resolve(events.find((e) => e.event_id === id) ?? null)
}
