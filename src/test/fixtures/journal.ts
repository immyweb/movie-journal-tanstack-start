import type { ShowcaseFilm } from '#/lib/tmdb/showcase'
import type { MovieSearchResult } from '#/lib/tmdb/search'
import type { MovieDetail } from '#/lib/tmdb/movie-detail'

export const fakeMovie = {
  tmdbId: '496243',
  title: 'Parasite',
  posterImg: 'https://image.tmdb.org/t/p/w342/poster.jpg',
  releaseDate: '2019-05-30',
  createdAt: new Date('2026-01-01T00:00:00Z'),
}

export const fakeJournalEntry = {
  id: 'entry_1',
  userId: 'user_1',
  movieId: fakeMovie.tmdbId,
  dateWatched: new Date('2026-07-12T00:00:00Z'),
  rating: 5,
  review: 'Still thinking about the stairs.',
  like: true,
  createdAt: new Date('2026-07-12T00:00:00Z'),
  updatedAt: new Date('2026-07-12T00:00:00Z'),
  movie: fakeMovie,
}

export const fakeMovieDetail: MovieDetail = {
  director: 'Bong Joon-ho',
  cast: ['Song Kang-ho', 'Lee Sun-kyun'],
  genre: 'Thriller, Drama',
  language: 'Korean',
  runtime: '132 min',
  backdropUrl: 'https://image.tmdb.org/t/p/original/backdrop.jpg',
  posterUrl: 'https://image.tmdb.org/t/p/w780/poster-large.jpg',
}

export const fakeSearchResult: MovieSearchResult = {
  tmdbId: fakeMovie.tmdbId,
  title: fakeMovie.title,
  releaseDate: fakeMovie.releaseDate,
  posterUrl: fakeMovie.posterImg,
}

export const showcaseFilms: Array<ShowcaseFilm> = [
  {
    tmdbId: '496243',
    title: 'Parasite',
    year: '2019',
    country: 'South Korea',
    rating: 5,
    liked: true,
    review: 'Still thinking about the stairs.',
    dateWatched: '12 Jul 2026',
    posterUrl: fakeMovie.posterImg,
  },
]
