import { useState } from 'react'

// PROTOTYPE for issue #13 — see src/routes/_authed.lists-prototype.tsx.
//
// In-memory only, per CONTEXT.md's List/ListItem shape (ADR 0013): a List
// has a name, optional description, and an ordered-by-addedAt array of
// items. No share token / share link here — that's issue #14's territory
// (the visitor-facing share view), not this ticket's create/add/remove/
// delete question.

export type PickerMovie = {
  tmdbId: string
  title: string
  releaseDate: string | null
  posterUrl: string | null
}

export type ListItemEntry = {
  movie: PickerMovie
  addedAt: Date
}

export type PrototypeList = {
  id: string
  name: string
  description: string | null
  createdAt: Date
  items: Array<ListItemEntry>
}

function seedLists(journalMovies: Array<PickerMovie>): Array<PrototypeList> {
  const [first, second, third] = journalMovies

  const seeded: Array<PrototypeList> = [
    {
      id: crypto.randomUUID(),
      name: 'Best of the decade',
      description: 'Films worth a rewatch.',
      createdAt: new Date(),
      items: [first, second]
        .filter((movie): movie is PickerMovie => !!movie)
        .map((movie) => ({ movie, addedAt: new Date() })),
    },
    {
      id: crypto.randomUUID(),
      name: 'Watch with Sam',
      description: null,
      createdAt: new Date(),
      items: [third]
        .filter((movie): movie is PickerMovie => !!movie)
        .map((movie) => ({ movie, addedAt: new Date() })),
    },
  ]

  return seeded
}

export function useListsPrototypeState(journalMovies: Array<PickerMovie>) {
  const [lists, setLists] = useState<Array<PrototypeList>>(() =>
    seedLists(journalMovies),
  )

  function createList(name: string, description: string | null) {
    const id = crypto.randomUUID()
    setLists((prev) => [
      ...prev,
      { id, name, description, createdAt: new Date(), items: [] },
    ])
    return id
  }

  function deleteList(listId: string) {
    setLists((prev) => prev.filter((list) => list.id !== listId))
  }

  function addMovie(listId: string, movie: PickerMovie) {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list
        // A Movie can appear on a List at most once (ADR 0013).
        if (list.items.some((item) => item.movie.tmdbId === movie.tmdbId)) {
          return list
        }
        return {
          ...list,
          items: [...list.items, { movie, addedAt: new Date() }],
        }
      }),
    )
  }

  function removeMovie(listId: string, tmdbId: string) {
    setLists((prev) =>
      prev.map((list) =>
        list.id !== listId
          ? list
          : {
              ...list,
              items: list.items.filter((item) => item.movie.tmdbId !== tmdbId),
            },
      ),
    )
  }

  return { lists, createList, deleteList, addMovie, removeMovie }
}

export type ListsPrototypeState = ReturnType<typeof useListsPrototypeState>
