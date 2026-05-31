export default function ResultCard({ candidate, rank }) {
  const score = candidate.score ?? 0
  const oneri = candidate.oneri ?? 'belki'

  const scoreColor =
    score >= 80 ? 'text-emerald-600' :
    score >= 60 ? 'text-amber-600' :
    'text-red-500'

  const scoreBg =
    score >= 80 ? 'bg-emerald-500' :
    score >= 60 ? 'bg-amber-400' :
    'bg-red-400'

  const oneriBadge = {
    evet:   { label: 'Öneriliyor',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    belki:  { label: 'Değerlendirin',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    hayır:  { label: 'Uygun Değil',    cls: 'bg-red-50 text-red-600 border-red-200' },
  }[oneri] ?? { label: oneri, cls: 'bg-slate-100 text-slate-500 border-slate-200' }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col gap-4">

      {/* Üst satır: sıra + isim + puan */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {rank != null && (
            <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
              {rank}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-slate-800 leading-tight">{candidate.name}</h3>
            <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 mt-1 inline-block ${oneriBadge.cls}`}>
              {oneriBadge.label}
            </span>
          </div>
        </div>

        {/* Puan dairesi */}
        <div className="flex flex-col items-center shrink-0">
          <span className={`text-2xl font-bold leading-none ${scoreColor}`}>{score}</span>
          <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Puan çubuğu */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${scoreBg}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Özet */}
      {candidate.ozet && (
        <p className="text-sm text-slate-600 leading-relaxed">{candidate.ozet}</p>
      )}

      {/* Güçlü yönler */}
      {candidate.guclu_yonler?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Güçlü Yönler</p>
          <ul className="space-y-1">
            {candidate.guclu_yonler.slice(0, 3).map((g, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Eksikler */}
      {candidate.eksikler?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Eksikler</p>
          <ul className="space-y-1">
            {candidate.eksikler.slice(0, 2).map((e, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                <span className="text-slate-300 mt-0.5 shrink-0">–</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
