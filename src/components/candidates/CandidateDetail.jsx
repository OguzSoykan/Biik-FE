export default function CandidateDetail({ candidate, loading, onClose }) {
  if (!candidate && !loading) return null

  const skills = candidate?.skills ?? []
  const companies = candidate?.companies ?? []
  const education = candidate?.education ?? []
  const positions = candidate?.positions ?? []
  const certificates = candidate?.certificates ?? []
  const projects = candidate?.projects ?? []

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {loading ? 'Yükleniyor…' : candidate.name}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="px-6 py-10 flex justify-center">
            <div className="w-7 h-7 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {skills.length > 0 && (
              <Section title="Yetenekler">
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span key={`${s}-${i}`} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {positions.length > 0 && (
              <Section title="Pozisyonlar">
                <ul className="space-y-1">
                  {positions.map((p, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      <span className="font-medium">{p.name}</span>
                      {p.company && <span className="text-slate-400"> @ {p.company}</span>}
                      {(p.start || p.end) && (
                        <span className="text-slate-400"> ({p.start || '?'}–{p.end || 'halen'})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {companies.length > 0 && (
              <Section title="Şirketler">
                <ul className="space-y-1">
                  {companies.map((c, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      <span className="font-medium">{c.name}</span>
                      {c.role && <span className="text-slate-400"> — {c.role}</span>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {projects.length > 0 && (
              <Section title="Projeler">
                <ul className="space-y-2">
                  {projects.map((p, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      <span className="font-medium">{p.name}</span>
                      {p.description && <p className="text-slate-500 text-xs mt-0.5">{p.description}</p>}
                      {p.skills?.length > 0 && (
                        <span className="text-slate-400 text-xs">{p.skills.join(', ')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {education.length > 0 && (
              <Section title="Eğitim">
                <ul className="space-y-1">
                  {education.map((e, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      {e.degree || '?'}
                      {e.institution && <span className="text-slate-500"> — {e.institution}</span>}
                      {e.year && <span className="text-slate-400"> ({e.year})</span>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {certificates.length > 0 && (
              <Section title="Sertifikalar">
                <ul className="space-y-1">
                  {certificates.map((c, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      {c.name}
                      {c.year && <span className="text-slate-400"> ({c.year})</span>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {skills.length === 0 && companies.length === 0 && education.length === 0 &&
             positions.length === 0 && certificates.length === 0 && projects.length === 0 && (
              <p className="text-sm text-slate-400">Bu aday için ayrıntılı graph verisi bulunamadı.</p>
            )}

            {candidate.status && (
              <div className="pt-2">
                <span className="text-xs text-slate-400">Durum: </span>
                <span className="text-xs font-medium text-slate-600">{candidate.status}</span>
              </div>
            )}
          </div>
        )}
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
