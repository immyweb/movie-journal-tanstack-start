# Cache Movie summary fields at add-time; fetch detail fields live from TMDB

When a user adds a movie, its summary fields (title, posterImg, releaseDate) are written into the `Movie` table immediately, since the Journal listing page is performance-critical and uses server-side filtering (SYSTEM-DESIGN.md). The richer detail-page-only fields (director, cast, genre, language, runtime) are fetched live from TMDB on demand rather than persisted, accepting a TMDB dependency on the less-critical detail page in exchange for a smaller write path and no staleness concerns for data that's viewed once.
