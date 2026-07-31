/**
 * API katmanı — domain bazlı modüllerin tek giriş noktası.
 *
 *   client.js      axios instance + hata normalizasyonu (err.userMessage)
 *   cv.js          yükleme, aday listesi, tekil pipeline adımları
 *   processing.js  /bulk-process SSE akışı
 *   search.js      /recommend, /search, /search/cypher
 */
export { default as api, API_BASE_URL } from './client'
export * from './cv'
export * from './processing'
export * from './search'

export { default } from './client'
