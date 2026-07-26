import { QUEUE_STATUS } from '../../constants/pipeline'
import PipelineProgress from './PipelineProgress'

const STATUS_META = {
  [QUEUE_STATUS.QUEUED]: { label: 'Sırada', cls: 'bg-slate-100 text-slate-500' },
  [QUEUE_STATUS.RUNNING]: { label: 'İşleniyor...', cls: 'bg-indigo-50 text-indigo-600' },
  [QUEUE_STATUS.DONE]: { label: 'Tamamlandı', cls: 'bg-emerald-50 text-emerald-600' },
  [QUEUE_STATUS.FAILED]: { label: 'Başarısız', cls: 'bg-red-50 text-red-600' },
  [QUEUE_STATUS.INTERRUPTED]: { label: 'Yarıda kaldı', cls: 'bg-amber-50 text-amber-600' },
}

export default function QueueItem({ item, onRetry }) {
  const meta = STATUS_META[item.status] ?? STATUS_META[QUEUE_STATUS.QUEUED]
  const retryable =
    item.status === QUEUE_STATUS.FAILED || item.status === QUEUE_STATUS.INTERRUPTED

  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-sm font-medium text-slate-700 truncate">{item.filename}</span>
        <div className="flex items-center gap-2 shrink-0">
          {retryable && (
            <button
              onClick={() => onRetry(item.filename)}
              className="text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1 transition-colors"
            >
              ↻ Yeniden dene
            </button>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.cls}`}>
            {meta.label}
          </span>
        </div>
      </div>

      {item.error && (
        <p className="text-xs text-red-500 mb-2 truncate" title={item.error}>
          {item.error}
        </p>
      )}

      <PipelineProgress item={item} />
    </div>
  )
}
