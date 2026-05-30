import { useCallback, useEffect, useRef, useState } from 'react'
import { getJobs } from '../api/index'

/**
 * GET /jobs endpoint'ini poll eden hook.
 * App seviyesinde çağrılır — sayfa değişiminden etkilenmez.
 *
 * Aktif job varsa 1.5s, yoksa 5s aralıkla poll eder.
 * setInterval yerine setTimeout zinciri kullanır: her fetch bittikten
 * SONRA bir sonraki zamanlama yapılır, böylece interval sıfırlanmaz.
 *
 * @param {number} _intervalMs - Kullanılmıyor, geriye dönük uyumluluk
 * @param {() => void} onConnectionError - 3 ardışık hata sonrası çağrılır
 */
export function useJobPolling(_intervalMs = 2000, onConnectionError) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Ref: en güncel jobs listesi — effect'te dependency olmadan okunur
  const jobsRef = useRef([])
  const timeoutRef = useRef(null)
  const consecutiveErrors = useRef(0)
  const errorNotified = useRef(false)

  const fetchJobs = useCallback(async () => {
    try {
      const data = await getJobs()
      const list = data.jobs || []
      jobsRef.current = list
      setJobs(list)
      consecutiveErrors.current = 0
      errorNotified.current = false
    } catch {
      consecutiveErrors.current += 1
      if (consecutiveErrors.current >= 3 && !errorNotified.current) {
        errorNotified.current = true
        onConnectionError?.()
      }
    } finally {
      setLoading(false)
    }
  }, [onConnectionError])

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      await fetchJobs()
      if (cancelled) return

      // Fetch bittikten sonra uygun gecikmeyi hesapla
      const hasActive = jobsRef.current.some(
        (j) => j.status === 'running' || j.status === 'queued',
      )
      const delay = hasActive ? 1500 : 5000
      timeoutRef.current = setTimeout(tick, delay)
    }

    tick()

    return () => {
      cancelled = true
      clearTimeout(timeoutRef.current)
    }
  }, [fetchJobs])

  return { jobs, loading, refetch: fetchJobs }
}
