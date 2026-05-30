export default function ResultCard({ candidate }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-slate-800">{candidate.name}</h3>
        {candidate.score != null && (
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
            {Math.round(candidate.score * 100)}% eşleşme
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 6).map((s) => (
          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {s}
          </span>
        ))}
        {candidate.skills.length > 6 && (
          <span className="text-xs text-slate-400">+{candidate.skills.length - 6}</span>
        )}
      </div>
    </div>
  )
}
