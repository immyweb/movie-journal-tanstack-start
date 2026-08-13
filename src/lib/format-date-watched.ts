export function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

// Inverse of the UTC-anchored storage convention above: turns a stored
// dateWatched back into the "YYYY-MM-DD" shape a date input expects, reading
// UTC fields rather than local ones so the value doesn't drift a day in
// timezones west of UTC.
export function toISODateUTC(value: Date | string) {
  const date = toDate(value)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
