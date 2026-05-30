import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import PipelineProgress from '../components/PipelineProgress'
import UploadZone from '../components/UploadZone'
import { batchUpload } from '../api/index'
import { useJobs } from '../context/JobsContext'

export default function CVManager() {
  // Bu session'da yüklenen job_id'ler
  const [sessionJobIds, setSessionJobIds] = useState([])
  const [uploading, setUploading] = useState(false)

  const { jobs, loading } = useJobs()

  // Bu session'a ait job'ları context'ten filtrele
  const sessionJobs = jobs.filter((j) => sessionJobIds.includes(j.job_id))

  // -------------------------------------------------------------------------
  // Sunucu yeniden başlatma tespiti
  // Yalnızca en az bir kez polling'de görünmüş job'lar kaybolursa uyar.
  // Upload'dan hemen sonra polling henüz getirmemişken yanlış tetiklenmez.
  // -------------------------------------------------------------------------
  const restartNotified = useRef(false)
  // Polling'de en az bir kez onaylanmış job_id'ler
  const confirmedJobIds = useRef(new Set())

  // Poll sonucu session job'ları gördüğümüzde confirmed'e ekle
  useEffect(() => {
    sessionJobs.forEach((j) => confirmedJobIds.current.add(j.job_id))
  }, [sessionJobs])

  useEffect(() => {
    if (loading || sessionJobIds.length === 0 || restartNotified.current) return
    // Henüz hiçbir job polling'de görünmediyse restart mesajı gösterme
    if (confirmedJobIds.current.size === 0) return
    const serverIds = new Set(jobs.map((j) => j.job_id))
    const allMissing = sessionJobIds.every((id) => !serverIds.has(id))
    if (allMissing) {
      restartNotified.current = true
      toast.error('Sunucu yeniden başlatıldı — geçmiş jobs temizlendi.', {
        duration: 5000,
      })
      setSessionJobIds([])
    }
  }, [jobs, loading, sessionJobIds])

  // -------------------------------------------------------------------------
  // Tamamlanma / başarısızlık toast'ları
  // -------------------------------------------------------------------------
  const prevStatusRef = useRef({})

  useEffect(() => {
    sessionJobs.forEach((job) => {
      const prev = prevStatusRef.current[job.job_id]
      if (prev && prev !== job.status) {
        if (job.status === 'done') {
          toast.success(`${job.filename} tamamlandı!`)
        } else if (job.status === 'failed') {
          toast.error(`${job.filename} işlenemedi.`)
        }
      }
      prevStatusRef.current[job.job_id] = job.status
    })
  }, [sessionJobs])

  // -------------------------------------------------------------------------
  // Dosya yükleme
  // -------------------------------------------------------------------------
  const handleFilesSelected = useCallback(async (files) => {
    setUploading(true)
    try {
      const data = await batchUpload(files)
      const newIds = (data.jobs || []).map((j) => j.job_id)
      setSessionJobIds((prev) => [...prev, ...newIds])
      restartNotified.current = false
    } catch (err) {
      toast.error(`Yükleme başarısız: ${err?.response?.data?.detail ?? err.message}`)
    } finally {
      setUploading(false)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Tüm aktif job'lar bitince zone'u tekrar etkinleştir
  // -------------------------------------------------------------------------
  const anyActive = sessionJobs.some(
    (j) => j.status === 'running' || j.status === 'queued',
  )
  const zoneDisabled = uploading || anyActive

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">CV Yönetimi</h1>
      <p className="text-slate-500 text-sm mb-8">
        CV yükleyin ve pipeline adımlarını takip edin.
      </p>

      <UploadZone onFilesSelected={handleFilesSelected} disabled={zoneDisabled} />

      {sessionJobs.length > 0 && (
        <div className="mt-6 space-y-4">
          {sessionJobs.map((job) => (
            <div key={job.job_id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">
                  {job.filename}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    job.status === 'done'
                      ? 'bg-emerald-50 text-emerald-600'
                      : job.status === 'failed'
                        ? 'bg-red-50 text-red-600'
                        : job.status === 'running'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {job.status === 'queued' && 'Sırada'}
                  {job.status === 'running' && 'İşleniyor...'}
                  {job.status === 'done' && 'Tamamlandı'}
                  {job.status === 'failed' && 'Başarısız'}
                </span>
              </div>
              <PipelineProgress job={job} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
