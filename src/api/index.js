/**
 * API katmanı — domain bazlı modüllerin tek giriş noktası.
 *
 *   client.js      axios instance + hata normalizasyonu (err.userMessage)
 *   cv.js          yükleme, aday listesi, tekil pipeline adımları
 *   processing.js  /bulk-process SSE akışı
 *   search.js      /recommend, /search, /search/cypher
 *   feedback.js    /feedback, /feedback/stats
 */
export { default as api, API_BASE_URL } from './client'
export * from './cv'
export * from './processing'
export * from './search'
export * from './feedback'

export { default } from './client'
