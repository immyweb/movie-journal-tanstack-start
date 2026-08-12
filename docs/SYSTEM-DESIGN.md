# Movie Journal

## Requirements

### Core user journeys

- A simple CRUD app for adding movies a user has watched. Similar to Letterboxd.
- A user should be able to browse the movies they have added.

### Who are the users?

International English speaking.

### Device support

Should be fully responsive and support all devices (mobile, tablet, desktop)

### Do users have be signed in

They need to be signed in to add and view they movies.

### Non-functional requirements

- Strong SEO for homepage.
- Should have excellent performance (Lighthouse scores)
- Should be fully accessible.

## High Level Design

### Rendering Architecture

Performance and SEO is important for the homepage, therefore SSR will be used.
The authenticated pages not indexed, therefore a simpler CSR approaced can be used.

### Page Architecture

The public pages will use SSR with hydration.
The autenticated pages, we want a more app-like exprience, so an SPA solution will be used.

### Product Architecture

The frontend will use a monolith architecture.
This is a small project, so will explore using server components/actions for backend work, rather than a seperate API / backend.

### APIs

Direct API calls using Server Actions.
TMDB will be used to get movie data.

### Data processing

Search / filtering will be done server-side for performance reasons.

## Data Model

### MovieResults

- Source: Server
- Belongs to: Journal page
- Fields: results (list of MovieEntry), pagination (pagination metadata)

### MovieEntry

- Source: Server
- Belongs to: Journal/Detail page
- Fields: title, dateWatched, rating, review, like, posterImg, releaseDate, theMovieDbId

## Entities

### movie

id (string)
title (string)
dateWatched (string)
rating (number)
review (string)
like (boolean)
posterImg (string)
releaseDate (string)
theMovieDbId (string)

### user

id (string)
name (string)
email (string)

## API

### Journal entries

GET
`/movies`
Returns a list of watched movies.

#### Parameters

Size (number)
Page (number)
DateWatched (string)
Like (boolean)
Rating (number)
Title (string)

#### Sample response

```json
{
  // Pagination metadata.
  "pagination": {
    "size": 5,
    "page": 2,
    "total_pages": 15,
    "total": 74
  },
  "results": [
    {
      "id": "567890",
      "title": "The Matrix",
      "dateWatched": "2026-05-05T14:48:00.000Z",
      "rating": "5",
      "like": "true",
      "posterImg": "https://www.placeholder.com/img/1.jpg",
      "theMovieDbId": "173827832"
    }
    // ... More movie results
  ]
}
```

Offset pagination is used.

- Page numbers is useful for navigating in the journal and jumping to specific pages.
- New movies are not added quickly, there the results do not become stale.
- Having total results is useful.

### Single movie

GET
`/movies/{id}`
Fetches the details of a movie.

#### Parameters

id (string)

#### Sample response

```json
{
  "id": "567890",
  "title": "The Matrix",
  "dateWatched": "2026-05-05T14:48:00.000Z",
  "rating": 5,
  "review": "A legenary sci-fi movie.",
  "like": true,
  "posterImg": "https://www.placeholder.com/img/1.jpg",
  "theMovieDbId": "173827832",
  "releaseDate": "1999",
  "info": {
    "director": "Watchowski Brothers",
    "cast": ["Keanu Reeves", "Carrie Anne Moss"],
    "genre": "scf-fi",
    "language": "English",
    "runtime": ""
  }
}
```

### Add a movie

POST
`/add-movie`
Add a movie to the their journal

#### Parameters

title (string)
dateWatched (string)
rating (number)
review (string)
like (boolean)
theMovieDbId (string)

#### Sample response

```json
{
  "id": "123456",
  "title": "Fight Club",
  "dateWatched": "2026-05-05T14:48:00.000Z",
  "rating": 5,
  "review": "A classic movie.",
  "like": true,
  "theMovieDbId": "173827627"
}
```

### Edit a movie

PUT
`/edit-movie/{id}`
Edit a movie entry

#### Parameters

id
dateWatched (string)
rating (number)
review (string)
like (boolean)

#### Sample response

```json
{
  "id": "123456",
  "title": "Fight Club",
  "dateWatched": "2026-05-05T14:48:00.000Z",
  "rating": 4,
  "review": "A classic movie, with great perfomances.",
  "like": true,
  "theMovieDbId": "173827627"
}
```

### Delete a movie

DELETE
`/delete-movie/{id}`
Remove a movie entry

#### Parameters

id

## Performance

### Image optimisations

- Use responsive images. Server the most suitable image for the device.
- Use `webP` for photos and SVGs for icons.
- For image carousels use image preloading and lazy loading.

### Performance monitoring

- Use tools such as Lighthose and Web Vitals to profile websites and measure performance.

## Device support

- Use responsive images: serve the most suitable device for the device.
- Device-specific UI:
  - No display map on mobile devices.
  - Support swipping on image carousels.
  - Interactive elements should be larger on mobile.

## Accessibility

- The site should be fully accessible (WCAG AA coverage).
- Images should be alt text
- Forms should have labels and error states.
- Use semantic HTML and aria tags.
