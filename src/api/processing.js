import { API_BASE_URL } from './client'

/**
 * POST /bulk-process SSE akışını tüketir.
 *
 * @param {string[]} filenames  işlenecek (uploads/ altındaki) dosya adları
 * @param {(event: object) => void} onEvent  her SSE olayı için çağrılır
 * @param {AbortSignal} [signal]  akışı iptal etmek için
 *
 * Not: Bu akış istemci bağlantısına bağlıdır — sekme kapanırsa sunucudaki
 * işleme de durur. Kalıcı (sunucu-sahipli) kuyruk için backend'de job_id
 * tabanlı arka plan işleme gerekir; bu modül o geçişte tek dokunulacak yerdir.
 */
export async function streamBulkProcess(filenames, onEvent, signal) {
  const response = await fetch(`${API_BASE_URL}/bulk-process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filenames }),
    signal,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Pipeline başlatılamadı (HTTP ${response.status})`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        onEvent(JSON.parse(line.slice(6)))
      } catch {
        // bozuk satır — atla
      }
    }
  }
}
