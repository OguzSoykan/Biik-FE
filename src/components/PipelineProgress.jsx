const STEPS = [
  { key: 'ingest', label: 'Yükleme' },
  { key: 'convert', label: 'Dönüştürme' },
  { key: 'extract', label: 'Extraction' },
  { key: 'embed', label: 'Embedding' },
  { key: 'write', label: "Memgraph'a Yazma" },
]

function formatDuration(ms) {
  if (ms == null) return null
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function StepIcon({ status }) {
  if (status === 'running') {
    return (
      <span
        className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
        aria-label="çalışıyor"
      />
    )
  }
  if (status === 'done') {
    return <span className="text-emerald-500 font-bold text-lg leading-none">✓</span>
  }
  if (status === 'skipped') {
    return <span className="text-blue-500 font-bold text-lg leading-none">✓</span>
  }
  if (status === 'error') {
    return <span className="text-red-500 font-bold text-lg leading-none">✕</span>
  }
  // idle
  return <span className="text-slate-300 text-lg leading-none">○</span>
}

function StepRow({ step, state }) {
  const { status, cached, duration_ms, error } = state

  return (
    <div className="flex items-center justify-between px-5 py-3">
      {/* İkon + etiket */}
      <div className="flex items-center gap-3">
        <StepIcon status={status} />
        <span className="text-sm text-slate-700">{step.label}</span>
        {cached && status !== 'idle' && (
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
            önbellekten
          </span>
        )}
      </div>

      {/* Durum / süre / hata */}
      <div className="flex items-center gap-2 min-w-0">
        {status === 'idle' && (
          <span className="text-xs text-slate-400">Bekliyor</span>
        )}
        {status === 'running' && (
          <span className="text-xs text-indigo-500 animate-pulse">Çalışıyor...</span>
        )}
        {(status === 'done' || status === 'skipped') && (
          <span className="text-xs text-slate-500">
            {formatDuration(duration_ms) ?? 'Tamamlandı'}
          </span>
        )}
        {status === 'error' && error && (
          <span
            className="text-xs text-red-500 truncate max-w-[180px]"
            title={error}
          >
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Props:
 *   job — job_store'dan gelen job objesi (GET /jobs response'undaki tek eleman)
 */
export default function PipelineProgress({ job }) {
  if (!job) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
      {STEPS.map((step) => {
        const state = job.steps?.[step.key] ?? {
          status: 'idle',
          cached: false,
          duration_ms: null,
          error: null,
        }
        return <StepRow key={step.key} step={step} state={state} />
      })}
    </div>
  )
}
