import { useState } from 'react'
import toast from 'react-hot-toast'
import { sendFeedback } from '../api'

/**
 * Aday kartındaki 👍/👎 geri bildirim butonları.
 * Bir kez oy verildikten sonra seçim gösterilir ve tekrar oy engellenir.
 */
export default function FeedbackButtons({ adayId, query, sessionId = null }) {
  const [selected, setSelected] = useState(null) // 'up' | 'down' | null
  const [sending, setSending] = useState(false)

  const vote = async (verdict) => {
    if (selected || sending) return
    setSending(true)
    try {
      await sendFeedback({ query, adayId, verdict, sessionId })
      setSelected(verdict)
      toast.success('Geri bildiriminiz kaydedildi')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Geri bildirim gönderilemedi')
    } finally {
      setSending(false)
    }
  }

  const btnClass = (verdict, activeCls) => {
    const base = 'text-base leading-none rounded-lg px-2.5 py-1.5 border transition-colors'
    if (selected === verdict) return `${base} ${activeCls}`
    if (selected || sending)
      return `${base} border-slate-100 text-slate-300 cursor-default`
    return `${base} border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer`
  }

  return (
    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
      <span className="text-xs text-slate-400">
        {selected ? 'Teşekkürler!' : 'Bu öneri isabetli miydi?'}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          aria-label="İsabetli öneri"
          disabled={!!selected || sending}
          onClick={() => vote('up')}
          className={btnClass('up', 'border-emerald-300 bg-emerald-50 text-emerald-600')}
        >
          👍
        </button>
        <button
          type="button"
          aria-label="İsabetsiz öneri"
          disabled={!!selected || sending}
          onClick={() => vote('down')}
          className={btnClass('down', 'border-red-300 bg-red-50 text-red-500')}
        >
          👎
        </button>
      </div>
    </div>
  )
}
