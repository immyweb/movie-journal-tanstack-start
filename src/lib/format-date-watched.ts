export function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

// dateWatched is stored as a UTC-anchored calendar date (see logFilm) —
// format in UTC too, so the date shown always matches what was picked,
// regardless of the viewer's local timezone.
export function formatDateWatched(value: Date | string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(toDate(value))
    .toUpperCase()
}
