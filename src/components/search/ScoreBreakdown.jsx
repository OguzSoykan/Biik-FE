const COMPONENTS = [
  { key: 'skill_match', label: 'Teknik beceri' },
  { key: 'position_match', label: 'Pozisyon uyumu' },
  { key: 'evidence_bonus', label: 'Kanıt desteği' },
  { key: 'experience_match', label: 'Deneyim süresi' },
]

/**
 * Deterministik skorun alt bileşenlerini çubuklarla gösterir.
 * null bileşen = sorgu için uygulanamaz (ağırlıktan düşmüştür) — "—" gösterilir.
 */
export default function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null
  const feedbackAdj = breakdown.feedback_adjustment

  return (
    <div className="space-y-1.5">
      {COMPONENTS.map(({ key, label }) => {
        const value = breakdown[key]
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
            {value == null ? (
              <span className="text-xs text-slate-300">— (bu sorguda uygulanmadı)</span>
            ) : (
              <>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${Math.round(value * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">
                  {Math.round(value * 100)}
                </span>
              </>
            )}
          </div>
        )
      })}
      {feedbackAdj != null && feedbackAdj !== 0 && (
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-xs text-slate-500 w-28 shrink-0">Geri bildirim</span>
          <span
            className={`text-xs font-medium ${feedbackAdj > 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {feedbackAdj > 0 ? `+${feedbackAdj}` : feedbackAdj} puan (benzer sorgu oyları)
          </span>
        </div>
      )}
    </div>
  )
}
