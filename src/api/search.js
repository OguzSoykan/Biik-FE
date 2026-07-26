import client from './client'

export const recommendCandidates = async (query, sessionId = null) => {
  const res = await client.post('/recommend', { query, session_id: sessionId })
  return res.data
}

export const searchCandidates = async (query, top_k = 10) => {
  const res = await client.post('/search', { query, top_k })
  return res.data
}

/** Text→Cypher debug hattı — üretilen Cypher ve ham row'lar dahil döner. */
export const cypherSearch = async (q) => {
  const res = await client.get('/search/cypher', { params: { q } })
  return res.data
}
