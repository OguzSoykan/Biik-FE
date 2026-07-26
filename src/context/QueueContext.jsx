import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { batchIngestFiles } from '../api/cv'
import { startBulkProcess, streamJobEvents } from '../api/processing'
import { QUEUE_STATUS, STEP_KEYS } from '../constants/pipeline'
import { QueueContext } from './queue-context'

/**
 * Global CV işleme kuyruğu — sunucu-sahipli job modeli.
 *
 * - /bulk-process job_id döner; pipeline SUNUCUDA koşar. Sekme kapansa,
 *   sayfa yenilense bile işleme devam eder.
 * - Provider, aktif job_id'yi localStorage'da saklar; açılışta job'a yeniden
 *   bağlanıp olayları ?since=0'dan replay ederek durumu aynen kurar.
 * - Ağ koptuğunda kaldığı olay index'inden backoff'lu yeniden bağlanır.
 * - İşleme sürerken yeni dosya eklenebilir: queued'lar aktif job bitince
 *   otomatik yeni job olarak gönderilir (sunucu job'ları zaten sıraya sokar).
 * - Başarısız CV'ler tekil olarak yeniden denenebilir.
 */

const STORAGE_KEY = 'biik-queue-v2'
const ACTIVE_JOB_KEY = 'biik-active-job-v2'
const MAX_RECONNECT_ATTEMPTS = 5

function makeInitialSteps() {
  return Object.fromEntries(
    STEP_KEYS.map((k) => [k, { status: 'idle', cached: false, duration_ms: null, error: null }])
  )
}

function makeItem(filename) {
  const steps = makeInitialSteps()
  steps.ingest = { status: 'done', cached: false, duration_ms: null, error: null }
  return { filename, status: QUEUE_STATUS.QUEUED, steps, error: null, addedAt: Date.now() }
}

function loadPersistedItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function loadActiveJob() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_JOB_KEY))
  } catch {
    return null
  }
}

function saveActiveJob(jobId) {
  try {
    if (jobId) localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify({ jobId }))
    else localStorage.removeItem(ACTIVE_JOB_KEY)
  } catch {
    /* opsiyonel */
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function QueueProvider({ children }) {
  const [items, setItems] = useState(loadPersistedItems)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const itemsRef = useRef(items)
  itemsRef.current = items
  const processingRef = useRef(false)
  const stepStartTimes = useRef({})

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* opsiyonel */
    }
  }, [items])

  const updateItem = useCallback((filename, updater) => {
    setItems((prev) => {
      const item = prev[filename]
      if (!item) return prev
      return { ...prev, [filename]: updater(item) }
    })
  }, [])

  const handleSseEvent = useCallback((event) => {
    const { type, filename, step, error, attempts } = event

    if (type === 'cv_start' || type === 'cv_retry') {
      updateItem(filename, (item) => {
        const steps = type === 'cv_retry' ? makeInitialSteps() : item.steps
        steps.ingest = { status: 'done', cached: false, duration_ms: null, error: null }
        return { ...item, status: QUEUE_STATUS.RUNNING, steps, error: null }
      })
    } else if (type === 'step_start') {
      if (!stepStartTimes.current[filename]) stepStartTimes.current[filename] = {}
      stepStartTimes.current[filename][step] = Date.now()
      updateItem(filename, (item) => ({
        ...item,
        steps: { ...item.steps, [step]: { status: 'running', cached: false, duration_ms: null, error: null } },
      }))
    } else if (type === 'step_done' || type === 'step_error') {
      const startedAt = stepStartTimes.current[filename]?.[step]
      const duration_ms = startedAt ? Date.now() - startedAt : null
      updateItem(filename, (item) => ({
        ...item,
        steps: {
          ...item.steps,
          [step]: {
            status: type === 'step_done' ? 'done' : 'error',
            cached: false,
            duration_ms,
            error: type === 'step_error' ? (error ?? 'Hata') : null,
          },
        },
      }))
    } else if (type === 'cv_done') {
      updateItem(filename, (item) => ({ ...item, status: QUEUE_STATUS.DONE }))
      toast.success(`${filename} tamamlandı${attempts > 1 ? ` (${attempts} deneme)` : ''}`)
    } else if (type === 'cv_failed') {
      updateItem(filename, (item) => ({
        ...item,
        status: QUEUE_STATUS.FAILED,
        error: error ?? 'İşleme başarısız',
      }))
      toast.error(`${filename} işlenemedi.`)
    }
    // job_start / complete: durum güncellemesi gerektirmez
  }, [updateItem])

  /**
   * Job'ın olay akışını, kopmalarda kaldığı index'ten devam ederek sonuna
   * kadar tüketir. Job sunucudan silinmişse ilgili item'ları interrupted yapar.
   */
  const followJob = useCallback(async (jobId, sinceIndex = 0) => {
    saveActiveJob(jobId)
    let index = sinceIndex
    let attempt = 0

    while (true) {
      try {
        index = await streamJobEvents(jobId, handleSseEvent, { since: index })
        saveActiveJob(null)
        return true // akış normal kapandı → job bitti
      } catch (err) {
        if (err.jobNotFound) {
          setItems((prev) =>
            Object.fromEntries(
              Object.entries(prev).map(([k, item]) => [
                k,
                item.status === QUEUE_STATUS.RUNNING || item.status === QUEUE_STATUS.QUEUED
                  ? { ...item, status: QUEUE_STATUS.INTERRUPTED, error: err.message }
                  : item,
              ])
            )
          )
          saveActiveJob(null)
          toast.error(err.message)
          return false
        }
        attempt += 1
        if (attempt > MAX_RECONNECT_ATTEMPTS) {
          toast.error(`Olay akışına yeniden bağlanılamadı: ${err.message}`)
          // Job sunucuda koşmaya devam ediyor — aktif job kaydını KORU ki
          // sayfa yenilenince tekrar bağlanılabilsin.
          return false
        }
        toast(`Bağlantı koptu, yeniden deneniyor (${attempt}/${MAX_RECONNECT_ATTEMPTS})...`)
        await sleep(1000 * attempt)
      }
    }
  }, [handleSseEvent])

  /** queued item'ları job'lara çevirip akışlarını sonuna kadar izler. */
  const drainQueue = useCallback(async () => {
    if (processingRef.current) return
    processingRef.current = true
    setProcessing(true)
    try {
      while (true) {
        const pending = Object.values(itemsRef.current)
          .filter((i) => i.status === QUEUE_STATUS.QUEUED)
          .sort((a, b) => a.addedAt - b.addedAt)
          .map((i) => i.filename)
        if (pending.length === 0) break

        let jobId
        try {
          const res = await startBulkProcess(pending)
          jobId = res.job_id
        } catch (err) {
          for (const filename of pending) {
            updateItem(filename, (item) => ({
              ...item,
              status: QUEUE_STATUS.INTERRUPTED,
              error: err.userMessage ?? err.message,
            }))
          }
          toast.error(`Job başlatılamadı: ${err.userMessage ?? err.message}`)
          break
        }

        const finished = await followJob(jobId, 0)
        if (!finished) break
      }
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }, [followJob, updateItem])

  // ---- Açılışta hydration: yarıda kalan job'a yeniden bağlan ----
  useEffect(() => {
    const stored = loadActiveJob()
    if (!stored?.jobId) {
      // Devam eden job yok: önceki oturumdan running/queued kalıntıları düşmüş demektir
      setItems((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([k, item]) => [
            k,
            item.status === QUEUE_STATUS.RUNNING || item.status === QUEUE_STATUS.QUEUED
              ? {
                  ...item,
                  status: QUEUE_STATUS.INTERRUPTED,
                  error: 'Önceki oturumda job başlatılamadan kapatıldı — yeniden deneyin.',
                }
              : item,
          ])
        )
      )
      return
    }

    // Sunucudaki job'a yeniden bağlan: olaylar 0'dan replay edilir,
    // durum (bu arada sunucuda tamamlananlar dahil) aynen yeniden kurulur.
    ;(async () => {
      processingRef.current = true
      setProcessing(true)
      try {
        await followJob(stored.jobId, 0)
      } finally {
        processingRef.current = false
        setProcessing(false)
        drainQueue() // bu oturumda birikmiş queued varsa devam et
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Dosyaları yükler ve kuyruğa ekler — işleme sürüyorsa sıraya girerler. */
  const enqueueFiles = useCallback(async (files) => {
    setUploading(true)
    let uploaded
    try {
      const data = await batchIngestFiles(files)
      uploaded = data.filenames ?? []
      if (data.skipped?.length) {
        toast.error(`${data.skipped.length} dosya desteklenmeyen türde, atlandı.`)
      }
      if (uploaded.length === 0) return
    } catch (err) {
      toast.error(`Yükleme başarısız: ${err.userMessage ?? err.message}`)
      return
    } finally {
      setUploading(false)
    }

    setItems((prev) => ({
      ...prev,
      ...Object.fromEntries(uploaded.map((f) => [f, makeItem(f)])),
    }))
    toast.success(`${uploaded.length} dosya kuyruğa eklendi`)
    queueMicrotask(drainQueue)
  }, [drainQueue])

  /** Başarısız/yarıda kalmış tek bir CV'yi yeniden kuyruğa alır. */
  const retryItem = useCallback((filename) => {
    updateItem(filename, () => makeItem(filename))
    queueMicrotask(drainQueue)
  }, [updateItem, drainQueue])

  /** Tamamlanmış/başarısız kayıtları listeden temizler (işleme dokunmaz). */
  const clearFinished = useCallback(() => {
    setItems((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(
          ([, i]) => i.status === QUEUE_STATUS.RUNNING || i.status === QUEUE_STATUS.QUEUED
        )
      )
    )
  }, [])

  const value = useMemo(() => {
    const list = Object.values(items).sort((a, b) => a.addedAt - b.addedAt)
    const counts = {
      total: list.length,
      queued: list.filter((i) => i.status === QUEUE_STATUS.QUEUED).length,
      running: list.filter((i) => i.status === QUEUE_STATUS.RUNNING).length,
      done: list.filter((i) => i.status === QUEUE_STATUS.DONE).length,
      failed: list.filter(
        (i) => i.status === QUEUE_STATUS.FAILED || i.status === QUEUE_STATUS.INTERRUPTED
      ).length,
    }
    return {
      items: list,
      counts,
      uploading,
      processing,
      enqueueFiles,
      retryItem,
      clearFinished,
    }
  }, [items, uploading, processing, enqueueFiles, retryItem, clearFinished])

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
}
