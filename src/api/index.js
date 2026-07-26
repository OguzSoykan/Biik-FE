import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
})

export const uploadCV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ingest', form)
}

export const batchIngestFiles = async (files) => {
  const form = new FormData()
  for (const file of files) {
    form.append('files', file)
  }
  const res = await api.post('/ingest/batch', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const getCandidates = (params = {}) => api.get('/candidates', { params })

export const convertCV = (filename) => api.post('/convert', { filename })
export const extractCV = (filename) => api.post('/extract', { filename })
export const embedCV = (filename) => api.post('/embed', { filename })
export const writeCV = (filename) => api.post('/write', { filename })

export const recommendCandidates = async (query, sessionId = null) => {
  const res = await api.post('/recommend', { query, session_id: sessionId })
  return res.data
}

export const sendFeedback = async ({ query, adayId, verdict, sessionId = null, comment = null }) => {
  const res = await api.post('/feedback', {
    query,
    aday_id: adayId,
    verdict,
    session_id: sessionId,
    comment,
  })
  return res.data
}

export const getFeedbackStats = async () => {
  const res = await api.get('/feedback/stats')
  return res.data
}

export const searchCandidates = async (query, top_k = 10) => {
  const res = await api.post('/search', { query, top_k })
  return res.data
}

export default api
