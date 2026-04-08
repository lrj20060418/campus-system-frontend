import {
  events,
  createEventRow,
  updateEventRow,
  deleteEventRow,
} from '../../mock/data.js'

export function listEvents() {
  return Promise.resolve([...events])
}

export function getEvent(eventId) {
  const id = Number(eventId)
  return Promise.resolve(events.find((e) => e.event_id === id) ?? null)
}

/** POST /api/events */
export function createEvent(payload) {
  const row = createEventRow(payload)
  return Promise.resolve(row)
}

/** PATCH /api/events/:id */
export function updateEvent(id, payload) {
  updateEventRow(id, payload)
  return getEvent(id)
}

/** DELETE /api/events/:id */
export function removeEvent(id) {
  deleteEventRow(id)
  return Promise.resolve()
}
