import client, { API_BASE_URL } from './client'

/**
 * Sunucu-sahipli işleme kuyruğu API'si.
 *
 * POST /bulk-process artık job_id döner; pipeline sunucuda, istemci
 * bağlantısından BAĞIMSIZ koşar. Olaylar GET /process/events/{job_id}
 * SSE'sinden okunur ve ?since=N ile kaldığı yerden replay edilir —
 * sekme kapanıp açılsa bile işleme kaybolmaz.
 */

/** Job başlatır. Dönüş: {job_id, status, queued_ahead} */
export const startBulkProcess = async (filenames) => {
  const res = await client.post('/bulk-process', { filenames })
  return res.data
}

/** Dönüş: {job_id, status, filenames, event_count} — job yoksa 404 fırlatır. */
export const getJobStatus = async (jobId) => {
  const res = await client.get(`/process/status/${jobId}`)
  return res.data
}

/** Bilinen job'lar (hydration için), en yenisi başta. */
export const listJobs = async () => {
  const res = await client.get('/process/jobs')
  return res.data.jobs
}

/**
 * Job'ın SSE olay akışını tüketir.
 *
 * @param {string} jobId
 * @param {(event: object, index: number) => void} onEvent  olay + global index
 * @param {{since?: number, signal?: AbortSignal}} [opts]
 * @returns {Promise<number>} okunan son olayın sonrasındaki index (reconnect için)
 *
 * Akış job bitince sunucu tarafından kapatılır. Ağ hatasında fırlatır —
 * çağıran taraf dönen index'le yeniden bağlanır (QueueContext bunu yapar).
 */
export async function streamJobEvents(jobId, onEvent, { since = 0, signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/process/events/${jobId}?since=${since}`,
    { signal }
  )

  if (response.status === 404) {
    const err = new Error('Job sunucuda bulunamadı (yeniden başlatılmış olabilir).')
    err.jobNotFound = true
    throw err
  }
  if (!response.ok) {
    throw new Error(`Olay akışı açılamadı (HTTP ${response.status})`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let index = since

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue // keepalive yorumları atlanır
      try {
        onEvent(JSON.parse(line.slice(6)), index)
        index += 1
      } catch {
        // bozuk satır — atla
      }
    }
  }
  return index
}
