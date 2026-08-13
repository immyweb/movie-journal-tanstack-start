export function formatReleaseYear(releaseDate: string | null) {
  return releaseDate ? releaseDate.slice(0, 4) : 'Year unknown'
}
