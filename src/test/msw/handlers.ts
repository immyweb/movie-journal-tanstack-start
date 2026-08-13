import type { HttpHandler } from 'msw'

// Empty by design (ADR-0011): MSW is reserved for genuine external HTTP
// boundaries (e.g. TMDB). Add a handler here only when a test needs one.
export const handlers: Array<HttpHandler> = []
