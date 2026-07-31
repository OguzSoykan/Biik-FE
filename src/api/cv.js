import client from './client'

export const uploadCV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/ingest', form)
}

export const batchIngestFiles = async (files) => {
  const form = new FormData()
  for (const file of files) {
    form.append('files', file)
  }
  const res = await client.post('/ingest/batch', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const getCandidates = (params = {}) => client.get('/candidates', { params })

/** Tek adayın tam profili (beceri, şirket, eğitim, pozisyon, sertifika, proje). */
export const getCandidate = async (adayId) => {
  const res = await client.get(`/candidates/${encodeURIComponent(adayId)}`)
  return res.data
}

// Tekil pipeline adımları — debug/manuel kullanım için korunur
export const convertCV = (filename) => client.post('/convert', { filename })
export const extractCV = (filename) => client.post('/extract', { filename })
export const embedCV = (filename) => client.post('/embed', { filename })
export const writeCV = (filename) => client.post('/write', { filename })
