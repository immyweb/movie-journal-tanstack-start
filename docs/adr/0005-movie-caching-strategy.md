---
status: partially superseded by ADR-0012 (genre moved to the cached summary fields to support Journal filtering; director, cast, language, and runtime remain live-fetched detail-only fields)
---

# Cache Movie summary fields at add-time; fetch detail fields live from TMDB

When a user adds a movie, its summary fields (title, posterImg, releaseDate) are written into the `Movie` table immediately, since the Journal listing page is performance-critical and uses server-side filtering (SYSTEM-DESIGN.md). The richer detail-page-only fields (director, cast, genre, language, runtime) are fetched live from TMDB on demand rather than persisted, accepting a TMDB dependency on the less-critical detail page in exchange for a smaller write path and no staleness concerns for data that's viewed once.

See ADR-0012: genre was later moved into the cached summary fields once the Journal needed to filter by it server-side. Director, cast, language, and runtime stay live-fetched — this ADR's reasoning still holds for them.
