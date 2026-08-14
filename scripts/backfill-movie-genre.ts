import 'dotenv/config'
import { Client } from 'pg'

// One-time backfill for Movie rows cached before ADR 0012 added genre. Run
// manually (`node scripts/backfill-movie-genre.ts`) and verify by hand — out
// of scope for automated testing per issue #4. Talks to Postgres and TMDB
// directly with raw SQL/fetch rather than importing the app's db/TMDB
// modules — those rely on extensionless relative imports and the `#/` path
// alias that only the app's Vite bundler resolves, not plain `node`.
async function fetchGenre(tmdbId: string): Promise<Array<string> | null> {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      accept: 'application/json',
    },
  })

  if (!response.ok) return null

  const data = (await response.json()) as { genres: Array<{ name: string }> }
  return data.genres.map((genre) => genre.name)
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    const { rows } = await client.query<{ tmdb_id: string; title: string }>(
      'SELECT tmdb_id, title FROM movie WHERE genre IS NULL',
    )

    console.log(`Backfilling genre for ${rows.length} movie row(s)...`)

    for (const row of rows) {
      const genre = await fetchGenre(row.tmdb_id)
      if (!genre) {
        console.warn(
          `  skip ${row.tmdb_id} (${row.title}) — TMDB lookup failed`,
        )
        continue
      }

      await client.query('UPDATE movie SET genre = $1 WHERE tmdb_id = $2', [
        genre,
        row.tmdb_id,
      ])

      console.log(`  ${row.tmdb_id} (${row.title}) -> [${genre.join(', ')}]`)
    }

    console.log('Done.')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
