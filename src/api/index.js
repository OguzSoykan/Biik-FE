import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
})

// ---------------------------------------------------------------------------
// Mevcut endpoint'ler — tekli CV işleme / geriye dönük uyumluluk
// ---------------------------------------------------------------------------

export const uploadCV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ingest', form)
}

export const getCandidates = () => api.get('/candidates')

export const convertCV = (filename) => api.post('/convert', { filename })

export const extractCV = (filename) => api.post('/extract', { filename })

export const embedCV = (filename) => api.post('/embed', { filename })

export const writeCV = (filename) => api.post('/write', { filename })

// ---------------------------------------------------------------------------
// Yeni job-based endpoint'ler
// ---------------------------------------------------------------------------

/**
 * Tüm job'ların durumunu döner.
 * @returns {Promise<{jobs: Array}>}
 */
export const getJobs = async () => {
  const res = await api.get('/jobs')
  return res.data
}

/**
 * Birden fazla dosyayı tek istekte yükler, her biri için job oluşturur.
 * @param {File[]} files
 * @returns {Promise<{jobs: Array<{job_id, filename, status}>}>}
 */
export const batchUpload = async (files) => {
  const form = new FormData()
  for (const file of files) {
    form.append('files', file)
  }
  const res = await api.post('/jobs/batch', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export default api
