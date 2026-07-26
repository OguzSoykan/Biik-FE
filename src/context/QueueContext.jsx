import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { batchIngestFiles } from '../api/cv'
import { streamBulkProcess } from '../api/processing'
import { QUEUE_STATUS, STEP_KEYS } from '../constants/pipeline'
import { QueueContext } from './queue-context'

/**
 * Global CV işleme kuyruğu.
 *
 * CVManager'daki sayfa-lokal state'in yerini alır:
 * - Sekme değiştirmek ilerlemeyi KAYBETTIRMEZ (state provider'da yaşar,
 *   SSE okuma döngüsü route değişiminden etkilenmez).
 * - İşleme sürerken yeni dosya eklenebilir: yeni gelenler "queued" bekler,
 *   aktif batch bitince otomatik yeni /bulk-process turu başlar.
 * - Başarısız/yarıda kalmış CV'ler tek tek yeniden denenebilir.
 * - Kuyruk görüntüsü localStorage'da saklanır: sayfa yenilenince son bilinen
 *   durum geri gelir; yenileme anında "running/queued" olanlar "interrupted"
 *   işaretlenir (SSE bağlantısı koptuğu için sunucudaki işleme durmuştur).
 *
 * Bilinen sınır: /bulk-process istemci bağlantısına bağlıdır — kalıcı,
 * sunucu-sahipli kuyruk için backend'de job_id tabanlı arka plan işleme
 * gerekir. O geçişte yalnızca bu provider ve api/processing.js değişir.
 */

const STORAGE_KEY = 'biik-queue-v1'

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

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const items = JSON.parse(raw)
    // Önceki oturumda yarıda kalanları işaretle — SSE koptuğu için sunucu durdu
    for (const item of Object.values(items)) {
      if (item.status === QUEUE_STATUS.RUNNING || item.status === QUEUE_STATUS.QUEUED) {
        item.status = QUEUE_STATUS.INTERRUPTED
        item.error = 'Sayfa kapatıldığı için işleme yarıda kaldı — yeniden deneyin.'
      }
    }
    return items
  } catch {
    return {}
  }
}

export function QueueProvider({ children }) {
  const [items, setItems] = useState(loadPersisted)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Stale-closure'a düşmemek için güncel state ref'te tutulur
  const itemsRef = useRef(items)
  itemsRef.current = items
  const processingRef = useRef(false)
  const stepStartTimes = useRef({})

  // Kalıcılık — her değişiklikte son durum yazılır
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* quota vb. — kalıcılık opsiyoneldir */
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
  }, [updateItem])

  /**
   * Kuyruk işleyicisi: "queued" ne varsa toplar, /bulk-process'e verir;
   * akış bitince bu sırada yeni eklenenler için yeni tur başlatır.
   */
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

        try {
          await streamBulkProcess(pending, handleSseEvent)
        } catch (err) {
          // Akış kurulamadı/koptu — bu turdaki tamamlanmamışlar interrupted
          for (const filename of pending) {
            updateItem(filename, (item) =>
              item.status === QUEUE_STATUS.DONE || item.status === QUEUE_STATUS.FAILED
                ? item
                : { ...item, status: QUEUE_STATUS.INTERRUPTED, error: err.message }
            )
          }
          toast.error(`Pipeline bağlantısı: ${err.message}`)
          break
        }
      }
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }, [handleSseEvent, updateItem])

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
    // State güncellemesi işlensin diye microtask sonrası başlat
    queueMicrotask(drainQueue)
  }, [drainQueue])

  /** Başarısız/yarıda kalmış tek bir CV'yi yeniden kuyruğa alır. */
  const retryItem = useCallback((filename) => {
    updateItem(filename, (item) => ({
      ...item,
      status: QUEUE_STATUS.QUEUED,
      steps: makeItem(filename).steps,
      error: null,
      addedAt: Date.now(),
    }))
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
