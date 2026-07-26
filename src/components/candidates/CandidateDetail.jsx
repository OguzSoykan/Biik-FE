export default function CandidateDetail({ candidate, onClose }) {
  if (!candidate) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{candidate.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <Section title="Yetenekler">
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s) => (
                <span key={s} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Şirketler">
            <ul className="space-y-1">
              {candidate.companies.map((c) => (
                <li key={c.name} className="text-sm text-slate-700">
                  <span className="font-medium">{c.name}</span>
                  {c.role && <span className="text-slate-400"> — {c.role}</span>}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Eğitim">
            <ul className="space-y-1">
              {candidate.education.map((e, i) => (
                <li key={i} className="text-sm text-slate-700">
                  {e.degree} — <span className="text-slate-500">{e.institution}</span>
                </li>
              ))}
            </ul>
          </Section>

          <div className="pt-2">
            <span className="text-xs text-slate-400">Durum: </span>
            <span className="text-xs font-medium text-slate-600">{candidate.status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  )
}
