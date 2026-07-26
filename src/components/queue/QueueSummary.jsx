import { useQueue } from '../../hooks/useQueue'

/** Kuyruğun toplam ilerleme özeti: sayaçlar + ilerleme çubuğu + temizleme. */
export default function QueueSummary() {
  const { counts, processing, clearFinished } = useQueue()
  if (counts.total === 0) return null

  const finished = counts.done + counts.failed
  const pct = counts.total ? Math.round((finished / counts.total) * 100) : 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {finished}/{counts.total} tamamlandı
          </span>
          {counts.running > 0 && <span className="text-indigo-600">{counts.running} işleniyor</span>}
          {counts.queued > 0 && <span>{counts.queued} sırada</span>}
          {counts.failed > 0 && <span className="text-red-500">{counts.failed} sorunlu</span>}
        </div>
        {!processing && finished > 0 && (
          <button
            onClick={clearFinished}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Bitenleri temizle
          </button>
        )}
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${processing ? 'bg-indigo-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
